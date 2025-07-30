# 存储与检索

> 生活中的一大痛苦是每个人对事物的命名都有些错误。因此，这使得世界上的一切比如果用不同的名称来命名时更难以理解。计算机并不是主要以进行算术运算的方式进行计算。[…] 它们主要是文件系统。
>
> 理查德·费曼，《特立独行的思维》研讨会（1985）

在最基本的层面上，数据库需要做两件事：当您给它一些数据时，它应该存储这些数据，而当您稍后再次询问时，它应该将数据还给您。

在第三章中，我们讨论了数据模型和查询语言——即您向数据库提供数据的格式，以及您稍后可以请求数据的接口。在本章中，我们从数据库的角度讨论相同的内容：数据库如何存储您提供的数据，以及当您请求数据时它如何再次找到这些数据。

作为应用程序开发者，您为什么要关心数据库如何在内部处理存储和检索？您可能不会从头开始实现自己的存储引擎，但您确实需要从众多可用的存储引擎中选择一个适合您应用程序的引擎。为了配置存储引擎以在您的工作负载上表现良好，您需要大致了解存储引擎在后台所做的事情。

特别是，针对事务工作负载（OLTP）优化的存储引擎与针对分析优化的存储引擎之间存在很大差异（我们在“分析系统与操作系统”中介绍了这种区别）。本章首先考察两类用于 OLTP 的存储引擎：写出不可变数据文件的日志结构存储引擎，以及像 B 树这样的就地更新数据的存储引擎。这些结构既用于键值存储，也用于辅助索引。

稍后在“分析的数据存储”中，我们将讨论一类针对分析优化的存储引擎，而在“多维和全文索引”中，我们将简要查看用于更高级查询（如文本检索）的索引。

## OLTP 的存储和索引

考虑世界上最简单的数据库，它由两个 Bash 函数实现：

```bash
#!/bin/bash

db_set () {
echo "$1,$2" >> database
}

db_get () {
grep "^$1," database | sed -e "s/^$1,//" | tail -n 1
}
```

这两个函数实现了一个键值存储。你可以调用 `db_set key value` ，它会将 `key` 和 `value` 存储在数据库中。键和值可以是你喜欢的（几乎）任何东西——例如，值可以是一个 JSON 文档。然后你可以调用 `db_get key`，它会查找与该特定键关联的最新值并返回它。

而且它有效：

```bash
$ db_set 12 '{"name":"London","attractions":["Big Ben","London Eye"]}'

$ db_set 42 '{"name":"San Francisco","attractions":["Golden Gate Bridge"]}'

$ db_get 42
{"name":"San Francisco","attractions":["Golden Gate Bridge"]}
```

存储格式非常简单：一个文本文件，每行包含一个键值对，用逗号分隔（大致像一个 CSV 文件，忽略转义问题）。每次调用 `db_set` 都会追加到文件的末尾。如果你多次更新一个键，旧版本的值不会被覆盖——你需要查看文件中该键的最后一次出现以找到最新值（因此在 `db_get` 中有 `tail -n 1` ）：

```bash
$ db_set 42 '{"name":"San Francisco","attractions":["Exploratorium"]}'

$ db_get 42
{"name":"San Francisco","attractions":["Exploratorium"]}

$ cat database
12,{"name":"London","attractions":["Big Ben","London Eye"]}
42,{"name":"San Francisco","attractions":["Golden Gate Bridge"]}
42,{"name":"San Francisco","attractions":["Exploratorium"]}
```

db_set 函数的性能实际上相当不错，尽管它非常简单，因为向文件追加内容通常是非常高效的。与 db_set 的做法类似，许多数据库内部使用日志，这是一种仅追加的数据文件。真正的数据库需要处理更多问题（例如处理并发写入、回收磁盘空间以防止日志无限增长，以及在从崩溃恢复时处理部分写入的记录），但基本原理是相同的。日志非常有用，我们将在本书中多次遇到它们。

::: tip **注意**

单词日志通常用于指代应用程序日志，其中应用程序输出描述正在发生的事情的文本。在本书中，日志是以更一般的意义使用的：磁盘上的仅追加记录序列。它不必是人类可读的；它可能是二进制的，仅供数据库系统内部使用。
:::

另一方面，如果您的数据库中有大量记录， db_get 函数的性能非常糟糕。每次您想查找一个键时， db_get 都必须从头到尾扫描整个数据库文件，寻找该键的出现。在算法术语中，查找的成本是 O(n)：如果您将数据库中的记录数 n 加倍，查找所需的时间也会加倍。这并不好。

In order to efficiently find the value for a particular key in the database, we need a different data structure: an index. In this chapter we will look at a range of indexing structures and see how they compare; the general idea is to structure the data in a particular way (e.g., sorted by some key) that makes it faster to locate the data you want. If you want to search the same data in several different ways, you may need several different indexes on different parts of the data.
为了高效地找到数据库中特定键的值，我们需要一种不同的数据结构：索引。在本章中，我们将查看一系列索引结构，并比较它们；一般的想法是以特定的方式（例如，按某个键排序）来构造数据，以便更快地定位所需的数据。如果您想以几种不同的方式搜索相同的数据，您可能需要在数据的不同部分上创建几个不同的索引。

An index is an additional structure that is derived from the primary data. Many databases allow you to add and remove indexes, and this doesn’t affect the contents of the database; it only affects the performance of queries. Maintaining additional structures incurs overhead, especially on writes. For writes, it’s hard to beat the performance of simply appending to a file, because that’s the simplest possible write operation. Any kind of index usually slows down writes, because the index also needs to be updated every time data is written.
索引是从主数据派生出的附加结构。许多数据库允许您添加和删除索引，这不会影响数据库的内容；它只会影响查询的性能。维护附加结构会产生开销，尤其是在写入时。对于写入操作，简单地向文件追加数据的性能很难被超越，因为这是一种最简单的写入操作。任何类型的索引通常会减慢写入速度，因为每次写入数据时，索引也需要更新。

This is an important trade-off in storage systems: well-chosen indexes speed up read queries, but every index consumes additional disk space and slows down writes, sometimes substantially [1]. For this reason, databases don’t usually index everything by default, but require you—the person writing the application or administering the database—to choose indexes manually, using your knowledge of the application’s typical query patterns. You can then choose the indexes that give your application the greatest benefit, without introducing more overhead on writes than necessary.
这是存储系统中的一个重要权衡：精心选择的索引可以加快读取查询，但每个索引都会消耗额外的磁盘空间并减慢写入速度，有时会显著减慢[1]。因此，数据库通常不会默认索引所有内容，而是要求您——编写应用程序或管理数据库的人——手动选择索引，利用您对应用程序典型查询模式的了解。然后，您可以选择那些为您的应用程序带来最大收益的索引，而不会在写入时引入不必要的额外开销。

Log-Structured Storage
日志结构存储

To start, let’s assume that you want to continue storing data in the append-only file written by db_set, and you just want to speed up reads. One way you could do this is by keeping a hash map in memory, in which every key is mapped to the byte offset in the file at which the most recent value for that key can be found, as illustrated in Figure 4-1.
首先，假设您希望继续在 db_set 写入的仅追加文件中存储数据，并且您只想加快读取速度。您可以通过在内存中保持一个哈希映射来实现这一点，其中每个键映射到文件中该键的最新值可以找到的字节偏移量，如图 4-1 所示。

ddia 0401
Figure 4-1. Storing a log of key-value pairs in a CSV-like format, indexed with an in-memory hash map.
图 4-1. 以类似 CSV 的格式存储键值对日志，并使用内存中的哈希映射进行索引。

Whenever you append a new key-value pair to the file, you also update the hash map to reflect the offset of the data you just wrote. When you want to look up a value, you use the hash map to find the offset in the log file, seek to that location, and read the value. If that part of the data file is already in the filesystem cache, a read doesn’t require any disk I/O at all.
每当您向文件中追加一个新的键值对时，您还会更新哈希映射，以反映您刚写入的数据的偏移量。当您想查找一个值时，您使用哈希映射找到日志文件中的偏移量，寻址到该位置并读取值。如果数据文件的那部分已经在文件系统缓存中，则读取根本不需要任何磁盘 I/O。

This approach is much faster, but it still suffers from several problems:
这种方法要快得多，但仍然存在几个问题：

You never free up disk space occupied by old log entries that have been overwritten; if you keep writing to the database you might run out of disk space.
您从未释放被旧日志条目占用的磁盘空间；如果您继续向数据库写入数据，可能会耗尽磁盘空间。

The hash map is not persisted, so you have to rebuild it when you restart the database—for example, by scanning the whole log file to find the latest byte offset for each key. This makes restarts slow if you have a lot of data.
哈希映射不会被持久化，因此在重新启动数据库时必须重建它——例如，通过扫描整个日志文件来查找每个键的最新字节偏移量。如果数据量很大，这会使重启变得缓慢。

The hash table must fit in memory. In principle, you could maintain a hash table on disk, but unfortunately it is difficult to make an on-disk hash map perform well. It requires a lot of random access I/O, it is expensive to grow when it becomes full, and hash collisions require fiddly logic [2].
哈希表必须适合内存。原则上，您可以在磁盘上维护一个哈希表，但不幸的是，使磁盘上的哈希映射表现良好是困难的。这需要大量的随机访问 I/O，当它变满时扩展成本高，并且哈希冲突需要复杂的逻辑 [2]。

Range queries are not efficient. For example, you cannot easily scan over all keys between 10000 and 19999—you’d have to look up each key individually in the hash map.
范围查询效率不高。例如，您无法轻松扫描所有介于 10000 和 19999 之间的键——您必须在哈希映射中逐个查找每个键。

The SSTable file format
SSTable 文件格式

In practice, hash tables are not used very often for database indexes, and instead it is much more common to keep data in a structure that is sorted by key [3]. One example of such a structure is a Sorted String Table, or SSTable for short, as shown in Figure 4-2. This file format also stores key-value pairs, but it ensures that they are sorted by key, and each key only appears once in the file.
在实际应用中，哈希表并不常用于数据库索引，而是更常见的是将数据保存在按键排序的结构中[3]。这种结构的一个例子是有序字符串表，简称 SSTable，如图 4-2 所示。该文件格式同样存储键值对，但确保它们按键排序，并且每个键在文件中只出现一次。

![ddia 0402](/public/ddia/ddia_0402.png)
Figure 4-2. An SSTable with a sparse index, allowing queries to jump to the right block.
图 4-2. 一个具有稀疏索引的 SSTable，允许查询跳转到正确的块。

Now you do not need to keep all the keys in memory: you can group the key-value pairs within an SSTable into blocks of a few kilobytes, and then store the first key of each block in the index. This kind of index, which stores only some of the keys, is called sparse. This index is stored in a separate part of the SSTable, for example using an immutable B-tree, a trie, or another data structure that allows queries to quickly look up a particular key [4].
现在您不需要将所有键都保存在内存中：您可以将 SSTable 中的键值对分组为几个千字节的块，然后将每个块的第一个键存储在索引中。这种只存储部分键的索引称为稀疏索引。该索引存储在 SSTable 的一个单独部分，例如使用不可变 B 树、字典树或其他允许快速查找特定键的数据结构[4]。

For example, in Figure 4-2, the first key of one block is handbag, and the first key of the next block is handsome. Now say you’re looking for the key handiwork, which doesn’t appear in the sparse index. Because of the sorting you know that handiwork must appear between handbag and handsome. This means you can seek to the offset for handbag and scan the file from there until you find handiwork (or not, if the key is not present in the file). A block of a few kilobytes can be scanned very quickly.
例如，在图 4-2 中，一个块的第一个键是 handbag ，下一个块的第一个键是 handsome 。现在假设你在寻找键 handiwork ，它并没有出现在稀疏索引中。由于排序，你知道 handiwork 必须出现在 handbag 和 handsome 之间。这意味着你可以寻址到 handbag 的偏移量，并从那里扫描文件，直到找到 handiwork （如果该键不在文件中，则可能找不到）。几千字节的块可以非常快速地扫描。

Moreover, each block of records can be compressed (indicated by the shaded area in Figure 4-2). Besides saving disk space, compression also reduces the I/O bandwidth use, at the cost of using a bit more CPU time.
此外，每个记录块都可以被压缩（如图 4-2 中的阴影区域所示）。除了节省磁盘空间，压缩还减少了 I/O 带宽的使用，但代价是需要使用更多的 CPU 时间。

Constructing and merging SSTables
构建和合并 SSTables

The SSTable file format is better for reading than an append-only log, but it makes writes more difficult. We can’t simply append at the end, because then the file would no longer be sorted (unless the keys happen to be written in ascending order). If we had to rewrite the whole SSTable every time a key is inserted somewhere in the middle, writes would become far too expensive.
SSTable 文件格式比仅追加日志更适合读取，但它使写入变得更加困难。我们不能简单地在末尾追加，因为那样文件将不再是排序的（除非键恰好以升序写入）。如果每次在中间插入一个键时都必须重写整个 SSTable，写入的成本将变得非常高。

We can solve this problem with a log-structured approach, which is a hybrid between an append-only log and a sorted file:
我们可以通过一种日志结构化的方法来解决这个问题，这是一种追加日志和排序文件的混合体：

When a write comes in, add it to an in-memory ordered map data structure, such as a red-black tree, skip list [5], or trie [6]. With these data structures, you can insert keys in any order, look them up efficiently, and read them back in sorted order. This in-memory data structure is called the memtable.
当写入请求到来时，将其添加到一个内存中的有序映射数据结构中，例如红黑树、跳表 [5] 或字典树 [6]。使用这些数据结构，您可以以任意顺序插入键，高效查找它们，并按排序顺序读取它们。这个内存数据结构称为 memtable。

When the memtable gets bigger than some threshold—typically a few megabytes—write it out to disk in sorted order as an SSTable file. We call this new SSTable file the most recent segment of the database, and it is stored as a separate file alongside the older segments. Each segment has a separate index of its contents. While the new segment is being written out to disk, the database can continue writing to a new memtable instance, and the old memtable’s memory is freed when the writing of the SSTable is complete.
当 memtable 的大小超过某个阈值——通常是几兆字节——时，将其以排序顺序写入磁盘，形成一个 SSTable 文件。我们将这个新的 SSTable 文件称为数据库的最新段，它作为一个单独的文件与旧段一起存储。每个段都有其内容的单独索引。在新的段被写入磁盘时，数据库可以继续写入一个新的 memtable 实例，而当 SSTable 的写入完成时，旧 memtable 的内存会被释放。

In order to read the value for some key, first try to find the key in the memtable and the most recent on-disk segment. If it’s not there, look in the next-older segment, etc. until you either find the key or reach the oldest segment. If the key does not appear in any of the segments, it does not exist in the database.
为了读取某个键的值，首先尝试在内存表和最新的磁盘段中查找该键。如果没有找到，则查看下一个较旧的段，依此类推，直到找到该键或到达最旧的段。如果在任何段中都没有找到该键，则表示它在数据库中不存在。

From time to time, run a merging and compaction process in the background to combine segment files and to discard overwritten or deleted values.
不时在后台运行合并和压缩过程，以组合段文件并丢弃被覆盖或删除的值。

Merging segments works similarly to the mergesort algorithm [5]. The process is illustrated in Figure 4-3: start reading the input files side by side, look at the first key in each file, copy the lowest key (according to the sort order) to the output file, and repeat. If the same key appears in more than one input file, keep only the more recent value. This produces a new merged segment file, also sorted by key, with one value per key, and it uses minimal memory because we can iterate over the SSTables one key at a time.
合并段的工作原理类似于归并排序算法 [5]。该过程如图 4-3 所示：开始并排读取输入文件，查看每个文件中的第一个键，将最低的键（根据排序顺序）复制到输出文件中，然后重复。如果同一个键出现在多个输入文件中，则只保留较新的值。这会生成一个新的合并段文件，同样按键排序，每个键只有一个值，并且它使用最少的内存，因为我们可以一次遍历一个键的 SSTable。

ddia 0403
Figure 4-3. Merging several SSTable segments, retaining only the most recent value for each key.
图 4-3. 合并多个 SSTable 段，仅保留每个键的最新值。

To ensure that the data in the memtable is not lost if the database crashes, the storage engine keeps a separate log on disk to which every write is immediately appended. This log is not sorted by key, but that doesn’t matter, because its only purpose is to restore the memtable after a crash. Every time the memtable has been written out to an SSTable, the corresponding part of the log can be discarded.
为了确保在数据库崩溃时内存表中的数据不会丢失，存储引擎在磁盘上保留一个单独的日志，所有写入操作都会立即附加到该日志中。这个日志并不是按键排序的，但这并不重要，因为它的唯一目的是在崩溃后恢复内存表。每当内存表被写入到 SSTable 时，日志中相应的部分可以被丢弃。

If you want to delete a key and its associated value, you have to append a special deletion record called a tombstone to the data file. When log segments are merged, the tombstone tells the merging process to discard any previous values for the deleted key. Once the tombstone is merged into the oldest segment, it can be dropped.
如果您想删除一个键及其相关值，您必须将一个称为墓碑的特殊删除记录附加到数据文件中。当日志段被合并时，墓碑会告诉合并过程丢弃被删除键的任何先前值。一旦墓碑被合并到最旧的段中，它就可以被丢弃。

The algorithm described here is essentially what is used in RocksDB [7], Cassandra, Scylla, and HBase [8], all of which were inspired by Google’s Bigtable paper [9] (which introduced the terms SSTable and memtable).
这里描述的算法本质上是 RocksDB [ 7]、Cassandra、Scylla 和 HBase [ 8]中使用的算法，所有这些都受到谷歌的 Bigtable 论文 [ 9]（引入了 SSTable 和内存表术语）的启发。

The algorithm was originally published in 1996 under the name Log-Structured Merge-Tree or LSM-Tree [10], building on earlier work on log-structured filesystems [11]. For this reason, storage engines that are based on the principle of merging and compacting sorted files are often called LSM storage engines.
该算法最初于 1996 年以日志结构合并树（Log-Structured Merge-Tree 或 LSM-Tree）[10]的名称发布，基于早期对日志结构文件系统的研究[11]。因此，基于合并和压缩排序文件原理的存储引擎通常被称为 LSM 存储引擎。

In LSM storage engines, a segment file is written in one pass (either by writing out the memtable or by merging some existing segments), and thereafter it is immutable. The merging and compaction of segments can be done in a background thread, and while it is going on, we can still continue to serve reads using the old segment files. When the merging process is complete, we switch read requests to using the new merged segment instead of the old segments, and then the old segment files can be deleted.
在 LSM 存储引擎中，段文件是在一次写入中生成的（要么通过写出内存表，要么通过合并一些现有段），此后它是不可变的。段的合并和压缩可以在后台线程中进行，在此过程中，我们仍然可以继续使用旧的段文件提供读取服务。当合并过程完成后，我们将读取请求切换到使用新的合并段，而不是旧的段，然后可以删除旧的段文件。

The segment files don’t necessarily have to be stored on local disk: they are also well suited for writing to object storage. SlateDB and Delta Lake [12]. take this approach, for example.
段文件不一定必须存储在本地磁盘上：它们也非常适合写入对象存储。例如，SlateDB 和 Delta Lake [12]采用了这种方法。

Having immutable segment files also simplifies crash recovery: if a crash happens while writing out the memtable or while merging segments, the database can just delete the unfinished SSTable and start afresh. The log that persists writes to the memtable could contain incomplete records if there was a crash halfway through writing a record, or if the disk was full; these are typically detected by including checksums in the log, and discarding corrupted or incomplete log entries. We will talk more about durability and crash recovery in Chapter 8.
拥有不可变的段文件也简化了崩溃恢复：如果在写出内存表或合并段时发生崩溃，数据库可以简单地删除未完成的 SSTable 并重新开始。持久化写入内存表的日志可能包含不完整的记录，如果在写入记录的过程中发生崩溃，或者如果磁盘已满；这些通常通过在日志中包含校验和来检测，并丢弃损坏或不完整的日志条目。我们将在第 8 章中详细讨论持久性和崩溃恢复。

Bloom filters
布隆过滤器

With LSM storage it can be slow to read a key that was last updated a long time ago, or that does not exist, since the storage engine needs to check several segment files. In order to speed up such reads, LSM storage engines often include a Bloom filter [13] in each segment, which provides a fast but approximate way of checking whether a particular key appears in a particular SSTable.
在 LSM 存储中，读取很久以前最后更新的键或不存在的键可能会很慢，因为存储引擎需要检查多个段文件。为了加快这种读取速度，LSM 存储引擎通常在每个段中包含一个布隆过滤器[13]，它提供了一种快速但近似的方法来检查特定键是否出现在特定的 SSTable 中。

Figure 4-4 shows an example of a Bloom filter containing two keys and 16 bits (in reality, it would contain more keys and more bits). For every key in the SSTable we compute a hash function, producing a set of numbers that are then interpreted as indexes into the array of bits [14]. We set the bits corresponding to those indexes to 1, and leave the rest as 0. For example, the key handbag hashes to the numbers (2, 9, 4), so we set the 2nd, 9th, and 4th bits to 1. The bitmap is then stored as part of the SSTable, along with the sparse index of keys. This takes a bit of extra space, but the Bloom filter is generally small compared to the rest of the SSTable.
图 4-4 展示了一个包含两个键和 16 位的布隆过滤器示例（实际上，它会包含更多的键和更多的位）。对于 SSTable 中的每个键，我们计算一个哈希函数，生成一组数字，然后将这些数字解释为位数组的索引[14]。我们将对应于这些索引的位设置为 1，其余的位保持为 0。例如，键 handbag 哈希到数字(2, 9, 4)，因此我们将第 2 位、第 9 位和第 4 位设置为 1。位图随后作为 SSTable 的一部分存储，连同稀疏键索引。这会占用一些额外的空间，但与 SSTable 的其余部分相比，布隆过滤器通常是小的。

ddia 0404
Figure 4-4. A Bloom filter provides a fast, probabilistic check whether a particular key exists in a particular SSTable.
图 4-4. 布隆过滤器提供了一种快速的概率性检查，判断特定键是否存在于特定的 SSTable 中。

When we want to know whether a key appears in the SSTable, we compute the same hash of that key as before, and check the bits at those indexes. For example, in Figure 4-4, we’re querying the key handheld, which hashes to (6, 11, 2). One of those bits is 1 (namely, bit number 2), while the other two are 0. These checks can be made extremely fast using the bitwise operations that all CPUs support.
当我们想知道一个键是否出现在 SSTable 中时，我们计算该键的相同哈希值，并检查这些索引处的位。例如，在图 4-4 中，我们查询键 handheld ，它哈希到(6, 11, 2)。其中一个位是 1（即，第 2 位），而另外两个是 0。这些检查可以通过所有 CPU 支持的位运算非常快速地完成。

If at least one of the bits is 0, we know that the key definitely does not appear in the SSTable. If the bits in the query are all 1, it’s likely that the key is in the SSTable, but it’s also possible that by coincidence all of those bits were set to 1 by other keys. This case when it looks as if a key is present, even though it isn’t, is called a false positive.
如果至少有一个位是 0，我们知道该键肯定不出现在 SSTable 中。如果查询中的所有位都是 1，那么该键很可能在 SSTable 中，但也有可能是由于巧合，所有这些位都被其他键设置为 1。这种看似存在键但实际上并不存在的情况称为假阳性。

The probability of false positives depends on the number of keys, the number of bits set per key, and the total number of bits in the Bloom filter. You can use an online calculator tool to work out the right parameters for your application [15]. As a rule of thumb, you need to allocate 10 bits of Bloom filter space for every key in the SSTable to get a false positive probability of 1%, and the probability is reduced tenfold for every 5 additional bits you allocate per key.
假阳性的概率取决于键的数量、每个键设置的位数以及布隆过滤器中的总位数。您可以使用在线计算工具来计算适合您应用程序的正确参数 [15]。作为经验法则，您需要为 SSTable 中的每个键分配 10 个位的布隆过滤器空间，以获得 1%的假阳性概率，并且每增加 5 个位的分配，概率将减少十倍。

In the context of an LSM storage engines, false positives are no problem:
在 LSM 存储引擎的上下文中，假阳性并不是问题：

If the Bloom filter says that a key is not present, we can safely skip that SSTable, since we can be sure that it doesn’t contain the key.
如果布隆过滤器表示某个键不存在，我们可以安全地跳过该 SSTable，因为我们可以确定它不包含该键。

If the Bloom filter says the key is present, we have to consult the sparse index and decode the block of key-value pairs to check whether the key really is there. If it was a false positive, we have done a bit of unnecessary work, but otherwise no harm is done—we just continue the search with the next-oldest segment.
如果布隆过滤器表示该键存在，我们必须查阅稀疏索引并解码键值对块，以检查该键是否真的存在。如果这是一个假阳性，我们做了一些不必要的工作，但否则没有造成任何损害——我们只需继续搜索下一个较旧的段。

Compaction strategies
压缩策略

An important detail is how the LSM storage chooses when to perform compaction, and which SSTables to include in a compaction. Many LSM-based storage systems allow you to configure which compaction strategy to use, and some of the common choices are [16]:
一个重要的细节是 LSM 存储如何选择何时执行压缩，以及选择哪些 SSTable 进行压缩。许多基于 LSM 的存储系统允许您配置使用哪种压缩策略，一些常见的选择是 [ 16 ]:

Size-tiered compaction
大小分层压缩
Newer and smaller SSTables are successively merged into older and larger SSTables. The SSTables containing older data can get very large, and merging them requires a lot of temporary disk space. The advantage of this strategy is that it can handle very high write throughput.
较新且较小的 SSTables 会逐步合并到较旧且较大的 SSTables 中。包含较旧数据的 SSTables 可能会变得非常大，合并它们需要大量的临时磁盘空间。这种策略的优点在于它可以处理非常高的写入吞吐量。

Leveled compaction
分层压缩
The key range is split up into smaller SSTables and older data is moved into separate “levels,” which allows the compaction to proceed more incrementally and use less disk space than the size-tiered strategy. This strategy is more efficient for reads than size-tiered compaction because the storage engine needs to read fewer SSTables to check whether they contain the key.
键范围被拆分成较小的 SSTables，较旧的数据被移动到单独的“层级”中，这使得压缩可以更增量地进行，并且使用的磁盘空间比大小分层策略少。这种策略在读取时比大小分层压缩更有效，因为存储引擎需要读取的 SSTables 更少，以检查它们是否包含该键。

As a rule of thumb, size-tiered compaction performs better if you have mostly writes and few reads, whereas leveled compaction performs better if your workload is dominated by reads. If you write a small number of keys frequently and a large number of keys rarely, then leveled compaction can also be advantageous [17].
作为经验法则，如果你的操作主要是写入且读取较少，则大小分层压缩表现更好；而如果你的工作负载以读取为主，则分层压缩表现更好。如果你频繁写入少量键而很少写入大量键，那么分层压缩也可能是有利的[17]。

Even though there are many subtleties, the basic idea of LSM-trees—keeping a cascade of SSTables that are merged in the background—is simple and effective. We discuss their performance characteristics in more detail in “Comparing B-Trees and LSM-Trees”.
尽管有许多细微之处，LSM 树的基本思想——保持一系列在后台合并的 SSTable——是简单而有效的。我们在“比较 B 树和 LSM 树”中更详细地讨论它们的性能特征。

Embedded storage engines
嵌入式存储引擎

Many databases run as a service that accepts queries over a network, but there are also embedded databases that don’t expose a network API. Instead, they are libraries that run in the same process as your application code, typically reading and writing files on the local disk, and you interact with them through normal function calls. Examples of embedded storage engines include RocksDB, SQLite, LMDB, DuckDB, and KùzuDB [18].
许多数据库作为服务运行，通过网络接受查询，但也有一些嵌入式数据库不暴露网络 API。相反，它们是与您的应用程序代码在同一进程中运行的库，通常在本地磁盘上读取和写入文件，您通过正常的函数调用与它们进行交互。嵌入式存储引擎的例子包括 RocksDB、SQLite、LMDB、DuckDB 和 KùzuDB [18]。

Embedded databases are very commonly used in mobile apps to store the local user’s data. On the backend, they can be an appropriate choice if the data is small enough to fit on a single machine, and if there are not many concurrent transactions. For example, in a multitenant system in which each tenant is small enough and completely separate from others (i.e., you do not need to run queries that combine data from multiple tenants), you can potentially use a separate embedded database instance per tenant [19].
嵌入式数据库在移动应用中非常常见，用于存储本地用户的数据。在后端，如果数据足够小以适合单台机器，并且并发事务不多，它们可以是一个合适的选择。例如，在一个多租户系统中，如果每个租户都足够小且与其他租户完全独立（即，您不需要运行结合多个租户数据的查询），您可以为每个租户使用一个单独的嵌入式数据库实例 [19]。

The storage and retrieval methods we discuss in this chapter are used in both embedded and in client-server databases. In Chapter 6 and Chapter 7 we will discuss techniques for scaling a database across multiple machines.
我们在本章讨论的存储和检索方法同时适用于嵌入式数据库和客户端-服务器数据库。在第 6 章和第 7 章中，我们将讨论在多台机器上扩展数据库的技术。

B-Trees
B 树

The log-structured approach is popular, but it is not the only form of key-value storage. The most widely used structure for reading and writing database records by key is the B-tree.
日志结构的方法很受欢迎，但这并不是唯一的键值存储形式。用于按键读取和写入数据库记录的最广泛使用的结构是 B 树。

Introduced in 1970 [20] and called “ubiquitous” less than 10 years later [21], B-trees have stood the test of time very well. They remain the standard index implementation in almost all relational databases, and many nonrelational databases use them too.
1970 年引入[20]，不到 10 年后被称为“无处不在”[21]，B 树经受住了时间的考验。它们仍然是几乎所有关系数据库中的标准索引实现，许多非关系数据库也使用它们。

Like SSTables, B-trees keep key-value pairs sorted by key, which allows efficient key-value lookups and range queries. But that’s where the similarity ends: B-trees have a very different design philosophy.
与 SSTables 类似，B 树按键对键值对进行排序，这允许高效的键值查找和范围查询。但相似之处到此为止：B 树有着非常不同的设计理念。

The log-structured indexes we saw earlier break the database down into variable-size segments, typically several megabytes or more in size, that are written once and are then immutable. By contrast, B-trees break the database down into fixed-size blocks or pages, and may overwrite a page in-place. A page is traditionally 4 KiB in size, but PostgreSQL now uses 8 KiB and MySQL uses 16 KiB by default.
我们之前看到的日志结构索引将数据库分解为可变大小的段，通常大小为几兆字节或更多，这些段被写入一次后便不可更改。相比之下，B 树将数据库分解为固定大小的块或页面，并可以就地覆盖页面。传统上，一个页面的大小为 4 KiB，但 PostgreSQL 现在默认使用 8 KiB，而 MySQL 默认使用 16 KiB。

Each page can be identified using a page number, which allows one page to refer to another—​similar to a pointer, but on disk instead of in memory. If all the pages are stored in the same file, multiplying the page number by the page size gives us the byte offset in the file where the page is located. We can use these page references to construct a tree of pages, as illustrated in Figure 4-5.
每个页面可以通过页面编号来识别，这使得一个页面可以引用另一个页面——类似于指针，但在磁盘上而不是在内存中。如果所有页面都存储在同一个文件中，将页面编号乘以页面大小可以得到页面在文件中的字节偏移量。我们可以使用这些页面引用来构建页面树，如图 4-5 所示。

ddia 0405
Figure 4-5. Looking up the key 251 using a B-tree index. From the root page we first follow the reference to the page for keys 200–300, then the page for keys 250–270.
图 4-5. 使用 B 树索引查找键 251。从根页面开始，我们首先跟随引用到键 200–300 的页面，然后是键 250–270 的页面。

One page is designated as the root of the B-tree; whenever you want to look up a key in the index, you start here. The page contains several keys and references to child pages. Each child is responsible for a continuous range of keys, and the keys between the references indicate where the boundaries between those ranges lie. (This structure is sometimes called a B+ tree, but we don’t need to distinguish it from other B-tree variants.)
一个页面被指定为 B 树的根；每当你想在索引中查找一个键时，你从这里开始。该页面包含几个键和对子页面的引用。每个子页面负责一系列连续的键，而引用之间的键指示这些范围之间的边界在哪里。（这种结构有时被称为 B + 树，但我们不需要将其与其他 B 树变体区分开。）

In the example in Figure 4-5, we are looking for the key 251, so we know that we need to follow the page reference between the boundaries 200 and 300. That takes us to a similar-looking page that further breaks down the 200–300 range into subranges. Eventually we get down to a page containing individual keys (a leaf page), which either contains the value for each key inline or contains references to the pages where the values can be found.
在图 4-5 的示例中，我们正在寻找键 251，因此我们知道需要在 200 和 300 的边界之间跟踪页面引用。这将我们带到一个类似的页面，该页面进一步将 200–300 范围细分为子范围。最终，我们到达一个包含单个键的页面（叶子页面），该页面要么在线包含每个键的值，要么包含指向可以找到值的页面的引用。

The number of references to child pages in one page of the B-tree is called the branching factor. For example, in Figure 4-5 the branching factor is six. In practice, the branching factor depends on the amount of space required to store the page references and the range boundaries, but typically it is several hundred.
B 树中一个页面对子页面的引用数量称为分支因子。例如，在图 4-5 中，分支因子为六。在实际应用中，分支因子取决于存储页面引用和范围边界所需的空间量，但通常为几百。

If you want to update the value for an existing key in a B-tree, you search for the leaf page containing that key, and overwrite that page on disk with a version that contains the new value. If you want to add a new key, you need to find the page whose range encompasses the new key and add it to that page. If there isn’t enough free space in the page to accommodate the new key, the page is split into two half-full pages, and the parent page is updated to account for the new subdivision of key ranges.
如果您想更新 B 树中现有键的值，您需要搜索包含该键的叶子页，并用包含新值的版本覆盖磁盘上的该页。如果您想添加一个新键，您需要找到范围包含新键的页面，并将其添加到该页面。如果页面中没有足够的空闲空间来容纳新键，则该页面将被拆分为两个半满的页面，并且父页面将被更新以反映键范围的新细分。

ddia 0406
Figure 4-6. Growing a B-tree by splitting a page on the boundary key 337. The parent page is updated to reference both children.
图 4-6. 通过在边界键 337 上拆分页面来扩展 B 树。父页面被更新以引用两个子页面。

In the example of Figure 4-6, we want to insert the key 334, but the page for the range 333–345 is already full. We therefore split it into a page for the range 333–337 (including the new key), and a page for 337–344. We also have to update the parent page to have references to both children, with a boundary value of 337 between them. If the parent page doesn’t have enough space for the new reference, it may also need to be split, and the splits can continue all the way to the root of the tree. When the root is split, we make a new root above it. Deleting keys (which may require nodes to be merged) is more complex [5].
在图 4-6 的例子中，我们想要插入键 334，但范围为 333–345 的页面已经满了。因此，我们将其拆分为一个范围为 333–337（包括新键）的页面和一个范围为 337–344 的页面。我们还必须更新父页面，以便对两个子页面都有引用，并在它们之间设置边界值 337。如果父页面没有足够的空间来容纳新的引用，它也可能需要被拆分，而拆分可以一直延续到树的根部。当根被拆分时，我们在其上方创建一个新的根。删除键（这可能需要合并节点）更为复杂[5]。

This algorithm ensures that the tree remains balanced: a B-tree with n keys always has a depth of O(log n). Most databases can fit into a B-tree that is three or four levels deep, so you don’t need to follow many page references to find the page you are looking for. (A four-level tree of 4 KiB pages with a branching factor of 500 can store up to 250 TB.)
该算法确保树保持平衡：具有 n 个键的 B 树的深度始终为 O(log n)。大多数数据库可以适应深度为三到四层的 B 树，因此您不需要跟踪许多页面引用就能找到所需的页面。（一个具有 500 的分支因子的 4 KiB 页面的四层树可以存储多达 250 TB。）

Making B-trees reliable
使 B 树可靠

The basic underlying write operation of a B-tree is to overwrite a page on disk with new data. It is assumed that the overwrite does not change the location of the page; i.e., all references to that page remain intact when the page is overwritten. This is in stark contrast to log-structured indexes such as LSM-trees, which only append to files (and eventually delete obsolete files) but never modify files in place.
B 树的基本写入操作是用新数据覆盖磁盘上的一个页面。假设覆盖操作不会改变页面的位置；也就是说，当页面被覆盖时，所有指向该页面的引用保持不变。这与日志结构索引（如 LSM 树）形成鲜明对比，后者只是在文件末尾追加数据（并最终删除过时的文件），但从不就地修改文件。

Overwriting several pages at once, like in a page split, is a dangerous operation: if the database crashes after only some of the pages have been written, you end up with a corrupted tree (e.g., there may be an orphan page that is not a child of any parent).
一次覆盖多个页面，例如在页面分裂时，是一个危险的操作：如果数据库在只有部分页面被写入后崩溃，最终会导致树结构损坏（例如，可能会出现一个孤立页面，它不是任何父页面的子页面）。

In order to make the database resilient to crashes, it is common for B-tree implementations to include an additional data structure on disk: a write-ahead log (WAL). This is an append-only file to which every B-tree modification must be written before it can be applied to the pages of the tree itself. When the database comes back up after a crash, this log is used to restore the B-tree back to a consistent state [2, 22]. In filesystems, the equivalent mechanism is known as journaling.
为了使数据库在崩溃时具有恢复能力，B 树实现通常会在磁盘上包含一个额外的数据结构：预写日志（WAL）。这是一个仅追加的文件，所有 B 树的修改必须在应用到树的页面之前写入该文件。当数据库在崩溃后重新启动时，这个日志用于将 B 树恢复到一致状态。在文件系统中，相应的机制被称为日志记录。

To improve performance, B-tree implementations typically don’t immediately write every modified page to disk, but buffer the B-tree pages in memory for a while first. The write-ahead log then also ensures that data is not lost in the case of a crash: as long as data has been written to the WAL, and flushed to disk using the fsync() system call, the data will be durable as the database will be able to recover it after a crash [23].
为了提高性能，B 树的实现通常不会立即将每个修改过的页面写入磁盘，而是先在内存中缓冲 B 树页面一段时间。写前日志（WAL）还确保在发生崩溃的情况下数据不会丢失：只要数据已写入 WAL，并通过 fsync() 系统调用刷新到磁盘，数据就会持久化，因为数据库能够在崩溃后恢复它[23]。

B-tree variants
B 树变体

As B-trees have been around for so long, many variants have been developed over the years. To mention just a few:
由于 B 树已经存在了很长时间，多年来开发了许多变体。仅举几例：

Instead of overwriting pages and maintaining a WAL for crash recovery, some databases (like LMDB) use a copy-on-write scheme [24]. A modified page is written to a different location, and a new version of the parent pages in the tree is created, pointing at the new location. This approach is also useful for concurrency control, as we shall see in “Snapshot Isolation and Repeatable Read”.
一些数据库（如 LMDB）采用写时复制方案，而不是覆盖页面并维护用于崩溃恢复的 WAL。修改后的页面被写入不同的位置，并在树中创建父页面的新版本，指向新位置。这种方法对于并发控制也很有用，正如我们将在“快照隔离和可重复读”中看到的那样。

We can save space in pages by not storing the entire key, but abbreviating it. Especially in pages on the interior of the tree, keys only need to provide enough information to act as boundaries between key ranges. Packing more keys into a page allows the tree to have a higher branching factor, and thus fewer levels.
我们可以通过不存储整个键，而是对其进行缩写来节省页面空间。特别是在树的内部页面中，键只需要提供足够的信息以作为键范围之间的边界。将更多的键打包到一个页面中可以使树具有更高的分支因子，从而减少层数。

To speed up scans over the key range in sorted order, some B-tree implementations try to lay out the tree so that leaf pages appear in sequential order on disk, reducing the number of disk seeks. However, it’s difficult to maintain that order as the tree grows.
为了加快对按顺序排列的键范围的扫描，一些 B 树实现尝试将树布局为叶页面在磁盘上按顺序出现，从而减少磁盘寻址的次数。然而，随着树的增长，保持这种顺序是困难的。

Additional pointers have been added to the tree. For example, each leaf page may have references to its sibling pages to the left and right, which allows scanning keys in order without jumping back to parent pages.
树中添加了额外的指针。例如，每个叶页面可能会有对其左右兄弟页面的引用，这样可以按顺序扫描键，而无需跳回父页面。

Comparing B-Trees and LSM-Trees
比较 B 树和 LSM 树

As a rule of thumb, LSM-trees are better suited for write-heavy applications, whereas B-trees are faster for reads [25, 26]. However, benchmarks are often sensitive to details of the workload. You need to test systems with your particular workload in order to make a valid comparison. Moreover, it’s not a strict either/or choice between LSM and B-trees: storage engines sometimes blend characteristics of both approaches, for example by having multiple B-trees and merging them LSM-style. In this section we will briefly discuss a few things that are worth considering when measuring the performance of a storage engine.
作为经验法则，LSM 树更适合写密集型应用，而 B 树在读取时更快[ 25, 26]。然而，基准测试通常对工作负载的细节非常敏感。您需要使用特定的工作负载测试系统，以便进行有效的比较。此外，LSM 和 B 树之间并不是严格的二选一选择：存储引擎有时会融合两种方法的特性，例如通过拥有多个 B 树并以 LSM 风格合并它们。在本节中，我们将简要讨论在测量存储引擎性能时值得考虑的一些事项。

Read performance
读取性能

In a B-tree, looking up a key involves reading one page at each level of the B-tree. Since the number of levels is usually quite small, this means that reads from a B-tree are generally fast and have predictable performance. In an LSM storage engine, reads often have to check several different SSTables at different stages of compaction, but Bloom filters help reduce the number of actual disk I/O operations required. Both approaches can perform well, and which is faster depends on the details of the storage engine and the workload.
在 B 树中，查找一个键涉及在 B 树的每一层读取一个页面。由于层数通常相对较少，这意味着从 B 树读取通常很快且性能可预测。在 LSM 存储引擎中，读取通常需要检查在不同压缩阶段的多个 SSTable，但布隆过滤器有助于减少所需的实际磁盘 I/O 操作次数。这两种方法都可以表现良好，哪种更快取决于存储引擎和工作负载的细节。

Range queries are simple and fast on B-trees, as they can use the sorted structure of the tree. On LSM storage, range queries can also take advantage of the SSTable sorting, but they need to scan all the segments in parallel and combine the results. Bloom filters don’t help for range queries (since you would need to compute the hash of every possible key within the range, which is impractical), making range queries more expensive than point queries in the LSM approach [27].
范围查询在 B 树上简单且快速，因为它们可以利用树的排序结构。在 LSM 存储上，范围查询也可以利用 SSTable 的排序，但它们需要并行扫描所有段并合并结果。布隆过滤器对范围查询没有帮助（因为你需要计算范围内每个可能键的哈希，这在实际操作中是不可行的），这使得在 LSM 方法中，范围查询的成本高于点查询 [27]。

High write throughput can cause latency spikes in a log-structured storage engine if the memtable fills up. This happens if data can’t be written out to disk fast enough, perhaps because the compaction process cannot keep up with incoming writes. Many storage engines, including RocksDB, perform backpressure in this situation: they suspend all reads and writes until the memtable has been written out to disk [28, 29].
如果内存表填满，高写入吞吐量可能会导致日志结构存储引擎的延迟峰值。这种情况发生在数据无法快速写入磁盘时，可能是因为压缩过程无法跟上传入的写入。许多存储引擎，包括 RocksDB，在这种情况下会执行背压：它们会暂停所有读取和写入，直到内存表被写入磁盘 [28, 29]。

Regarding read throughput, modern SSDs (and especially NVMe) can perform many independent read requests in parallel. Both LSM-trees and B-trees are able to provide high read throughput, but storage engines need to be carefully designed to take advantage of this parallelism [30].
关于读取吞吐量，现代 SSD（尤其是 NVMe）可以并行执行许多独立的读取请求。LSM 树和 B 树都能够提供高读取吞吐量，但存储引擎需要经过精心设计，以利用这种并行性 [30]。

Sequential vs. random writes
顺序写入与随机写入

With a B-tree, if the application writes keys that are scattered all over the key space, the resulting disk operations are also scattered randomly, since the pages that the storage engine needs to overwrite could be located anywhere on disk. On the other hand, a log-structured storage engine writes entire segment files at a time (either writing out the memtable or while compacting existing segments), which are much bigger than a page in a B-tree.
使用 B 树时，如果应用程序写入的键分散在整个键空间中，产生的磁盘操作也会随机分散，因为存储引擎需要覆盖的页面可能位于磁盘的任何位置。另一方面，日志结构存储引擎一次写入整个段文件（要么写出内存表，要么在压缩现有段时），这些段文件比 B 树中的页面要大得多。

The pattern of many small, scattered writes (as found in B-trees) is called random writes, while the pattern of fewer large writes (as found in LSM-trees) is called sequential writes. Disks generally have higher sequential write throughput than random write throughput, which means that a log-structured storage engine can generally handle higher write throughput on the same hardware than a B-tree. This difference is particularly big on spinning-disk hard drives (HDDs); on the solid state drives (SSDs) that most databases use today, the difference is smaller, but still noticeable (see “Sequential vs. Random Writes on SSDs”).
许多小的、分散的写入模式（如在 B 树中发现的）称为随机写入，而较少的大写入模式（如在 LSM 树中发现的）称为顺序写入。磁盘通常具有比随机写入更高的顺序写入吞吐量，这意味着日志结构存储引擎通常可以在相同硬件上处理比 B 树更高的写入吞吐量。这种差异在旋转磁盘硬盘（HDD）上尤其明显；在大多数数据库今天使用的固态硬盘（SSD）上，差异较小，但仍然显著（见“SSD 上的顺序写入与随机写入”）。

Sequential vs. Random Writes on SSDs
SSD 上的顺序写入与随机写入

On spinning-disk hard drives (HDDs), sequential writes are much faster than random writes: a random write has to mechanically move the disk head to a new position and wait for the right part of the platter to pass underneath the disk head, which takes several milliseconds—an eternity in computing timescales. However, SSDs (solid-state drives) including NVMe (Non-Volatile Memory Express, i.e. flash memory attached to the PCI Express bus) have now overtaken HDDs for many use cases, and they are not subject to such mechanical limitations.
在旋转磁盘硬盘（HDD）上，顺序写入的速度远快于随机写入：随机写入必须机械地将磁头移动到新位置，并等待盘片的正确部分经过磁头下方，这需要几毫秒——在计算机的时间尺度上，这是一段漫长的时间。然而，固态硬盘（SSD），包括 NVMe（非易失性内存快速通道，即连接到 PCI Express 总线的闪存），在许多使用案例中已经超越了 HDD，并且不受此类机械限制。

Nevertheless, SSDs also have higher throughput for sequential writes than for than random writes. The reason is that flash memory can be read or written one page (typically 4 KiB) at a time, but it can only be erased one block (typically 512 KiB) at a time. Some of the pages in a block may contain valid data, whereas others may contain data that is no longer needed. Before erasing a block, the controller must first move pages containing valid data into other blocks; this process is called garbage collection (GC) [31].
然而，SSD 在顺序写入方面的吞吐量也高于随机写入。原因在于闪存可以一次读取或写入一页（通常为 4 KiB），但只能一次擦除一个块（通常为 512 KiB）。一个块中的某些页面可能包含有效数据，而其他页面可能包含不再需要的数据。在擦除一个块之前，控制器必须首先将包含有效数据的页面移动到其他块中；这个过程称为垃圾回收（GC）[31]。

A sequential write workload writes larger chunks of data at a time, so it is likely that a whole 512 KiB block belongs to a single file; when that file is later deleted again, the whole block can be erased without having to perform any GC. On the other hand, with a random write workload, it is more likely that a block contains a mixture of pages with valid and invalid data, so the GC has to perform more work before a block can be erased [32, 33, 34].
顺序写入工作负载一次写入较大的数据块，因此一个完整的 512 KiB 块很可能属于单个文件；当该文件随后被删除时，整个块可以被擦除，而无需执行任何垃圾回收（GC）。另一方面，对于随机写入工作负载，一个块更可能包含有效和无效数据的混合，因此在块被擦除之前，GC 需要执行更多的工作 [32, 33, 34]。

The write bandwidth consumed by GC is then not available for the application. Moreover, the additional writes performed by GC contribute to wear on the flash memory; therefore, random writes wear out the drive faster than sequential writes.
GC 消耗的写入带宽因此无法用于应用程序。此外，GC 执行的额外写入会加速闪存的磨损；因此，随机写入比顺序写入更快地磨损驱动器。

Write amplification
写放大

With any type of storage engine, one write request from the application turns into multiple I/O operations on the underlying disk. With LSM-trees, a value is first written to the log for durability, then again when the memtable is written to disk, and again every time the key-value pair is part of a compaction. (If the values are significantly larger than the keys, this overhead can be reduced by storing values separately from keys, and performing compaction only on SSTables containing keys and references to values [35].)
无论何种类型的存储引擎，来自应用程序的一个写请求都会转化为对底层磁盘的多个 I/O 操作。使用 LSM 树时，值首先被写入日志以确保持久性，然后在 memtable 写入磁盘时再次写入，每当键值对参与压缩时也会再次写入。（如果值的大小明显大于键，可以通过将值与键分开存储，并仅对包含键和对值的引用的 SSTables 进行压缩，从而减少这种开销[35]。）

A B-tree index must write every piece of data at least twice: once to the write-ahead log, and once to the tree page itself. In addition, they sometimes need to write out an entire page, even if only a few bytes in that page changed, to ensure the B-tree can be correctly recovered after a crash or power failure [36, 37].
B 树索引必须至少写入每一条数据两次：一次写入预写日志，一次写入树页面本身。此外，即使该页面中只有几个字节发生了变化，它们有时也需要写出整个页面，以确保在崩溃或电源故障后 B 树能够正确恢复[36, 37]。

If you take the total number of bytes written to disk in some workload, and divide by the number of bytes you would have to write if you simply wrote an append-only log with no index, you get the write amplification. (Sometimes write amplification is defined in terms of I/O operations rather than bytes.) In write-heavy applications, the bottleneck might be the rate at which the database can write to disk. In this case, the higher the write amplification, the fewer writes per second it can handle within the available disk bandwidth.
如果你将某个工作负载中写入磁盘的总字节数除以如果你仅仅写入一个没有索引的追加日志所需写入的字节数，你就得到了写入放大率。（有时写入放大率是以 I/O 操作而不是字节来定义的。）在写入密集型应用中，瓶颈可能是数据库写入磁盘的速率。在这种情况下，写入放大率越高，它在可用磁盘带宽内能够处理的每秒写入次数就越少。

Write amplification is a problem in both LSM-trees and B-trees. Which one is better depends on various factors, such as the length of your keys and values, and how often you overwrite existing keys versus insert new ones. For typical workloads, LSM-trees tend to have lower write amplification because they don’t have to write entire pages and they can compress chunks of the SSTable [38]. This is another factor that makes LSM storage engines well suited for write-heavy workloads.
写入放大率在 LSM 树和 B 树中都是一个问题。哪种更好取决于各种因素，例如你的键和值的长度，以及你覆盖现有键与插入新键的频率。对于典型的工作负载，LSM 树往往具有较低的写入放大率，因为它们不需要写入整个页面，并且可以压缩 SSTable 的块[ 38]。这也是使 LSM 存储引擎非常适合写入密集型工作负载的另一个因素。

Besides affecting throughput, write amplification is also relevant for the wear on SSDs: a storage engine with lower write amplification will wear out the SSD less quickly.
除了影响吞吐量，写入放大率还与 SSD 的磨损相关：具有较低写入放大率的存储引擎将使 SSD 磨损得更慢。

When measuring the write throughput of a storage engine, it is important to run the experiment for long enough that the effects of write amplification become clear. When writing to an empty LSM-tree, there are no compactions going on yet, so all of the disk bandwidth is available for new writes. As the database grows, new writes need to share the disk bandwidth with compaction.
在测量存储引擎的写入吞吐量时，重要的是要进行足够长时间的实验，以便写放大效应变得明显。当写入一个空的 LSM 树时，还没有进行合并，因此所有的磁盘带宽都可用于新的写入。随着数据库的增长，新的写入需要与合并共享磁盘带宽。

Disk space usage
磁盘空间使用

B-trees can become fragmented over time: for example, if a large number of keys are deleted, the database file may contain a lot of pages that are no longer used by the B-tree. Subsequent additions to the B-tree can use those free pages, but they can’t easily be returned to the operating system because they are in the middle of the file, so they still take up space on the filesystem. Databases therefore need a background process that moves pages around to place them better, such as the vacuum process in PostgreSQL [23].
B 树可能会随着时间的推移而变得碎片化：例如，如果大量键被删除，数据库文件可能会包含许多不再被 B 树使用的页面。后续对 B 树的添加可以使用这些空闲页面，但由于它们位于文件中间，因此无法轻易返回给操作系统，因此它们仍然占用文件系统的空间。因此，数据库需要一个后台进程来移动页面，以便更好地放置它们，例如 PostgreSQL 中的清理进程 [23]。

Fragmentation is less of a problem in LSM-trees, since the compaction process periodically rewrites the data files anyway, and SSTables don’t have pages with unused space. Moreover, blocks of key-value pairs can better be compressed in SSTables, and thus often produce smaller files on disk than B-trees. Keys and values that have been overwritten continue to consume space until they are removed by a compaction, but this overhead is quite low when using leveled compaction [38, 39]. Size-tiered compaction (see “Compaction strategies”) uses more disk space, especially temporarily during compaction.
在 LSM 树中，碎片化问题较小，因为压缩过程会定期重写数据文件，而且 SSTable 没有带有未使用空间的页面。此外，键值对块在 SSTable 中可以更好地压缩，因此通常在磁盘上产生比 B 树更小的文件。被覆盖的键和值在被压缩移除之前会继续占用空间，但在使用分层压缩时，这种开销相当低 [38, 39]。大小分层压缩（见“压缩策略”）在压缩期间会使用更多的磁盘空间，尤其是暂时。

Having multiple copies of some data on disk can also be a problem when you need to delete some data, and be confident that it really has been deleted (perhaps to comply with data protection regulations). For example, in most LSM storage engines a deleted record may still exist in the higher levels until the tombstone representing the deletion has been propagated through all of the compaction levels, which may take a long time. Specialist storage engine designs can propagate deletions faster [40].
在磁盘上拥有某些数据的多个副本在需要删除某些数据时也可能成为问题，并且需要确保这些数据确实已被删除（可能是为了遵守数据保护法规）。例如，在大多数 LSM 存储引擎中，已删除的记录可能仍然存在于更高的层级，直到表示删除的墓碑在所有压缩层级中传播，这可能需要很长时间。专业的存储引擎设计可以更快地传播删除操作 [40]。

On the other hand, the immutable nature of SSTable segment files is useful if you want to take a snapshot of a database at some point in time (e.g. for a backup or to create a copy of the database for testing): you can write out the memtable and record which segment files existed at that point in time. As long as you don’t delete the files that are part of the snapshot, you don’t need to actually copy them. In a B-tree whose pages are overwritten, taking such a snapshot efficiently is more difficult.
另一方面，SSTable 段文件的不可变特性在你想要在某个时间点对数据库进行快照时非常有用（例如，用于备份或创建数据库的测试副本）：你可以将内存表写出，并记录在那个时间点存在的段文件。只要你不删除快照中包含的文件，就不需要实际复制它们。在一个页面被覆盖的 B 树中，高效地进行这样的快照则更加困难。

Multi-Column and Secondary Indexes
多列和二级索引

So far we have only discussed key-value indexes, which are like a primary key index in the relational model. A primary key uniquely identifies one row in a relational table, or one document in a document database, or one vertex in a graph database. Other records in the database can refer to that row/document/vertex by its primary key (or ID), and the index is used to resolve such references.
到目前为止，我们只讨论了键值索引，这类似于关系模型中的主键索引。主键唯一标识关系表中的一行，或文档数据库中的一个文档，或图数据库中的一个顶点。数据库中的其他记录可以通过其主键（或 ID）引用该行/文档/顶点，索引用于解析这些引用。

It is also very common to have secondary indexes. In relational databases, you can create several secondary indexes on the same table using the CREATE INDEX command, allowing you to search by columns other than the primary key. For example, in Figure 3-1 in Chapter 3 you would most likely have a secondary index on the user_id columns so that you can find all the rows belonging to the same user in each of the tables.
二级索引也是非常常见的。在关系数据库中，您可以使用 CREATE INDEX 命令在同一表上创建多个二级索引，从而允许您按主键以外的列进行搜索。例如，在第 3 章的图 3-1 中，您很可能会在 user_id 列上有一个二级索引，以便您可以找到每个表中属于同一用户的所有行。

A secondary index can easily be constructed from a key-value index. The main difference is that in a secondary index, the indexed values are not necessarily unique; that is, there might be many rows (documents, vertices) under the same index entry. This can be solved in two ways: either by making each value in the index a list of matching row identifiers (like a postings list in a full-text index) or by making each entry unique by appending a row identifier to it. Storage engines with in-place updates, like B-trees, and log-structured storage can both be used to implement an index.
二级索引可以很容易地从键值索引构建。主要区别在于，在二级索引中，索引的值不一定是唯一的；也就是说，可能在同一个索引条目下有多行（文档、顶点）。这可以通过两种方式解决：要么使索引中的每个值成为匹配行标识符的列表（类似于全文索引中的发布列表），要么通过附加行标识符使每个条目唯一。具有就地更新功能的存储引擎，如 B 树和日志结构存储，都可以用于实现索引。

Storing values within the index
在索引中存储值

The key in an index is the thing that queries search by, but the value can be one of several things:
索引中的键是查询搜索的对象，但值可以是几种不同的东西：

If the actual data (row, document, vertex) is stored directly within the index structure, it is called a clustered index. For example, in MySQL’s InnoDB storage engine, the primary key of a table is always a clustered index, and in SQL Server, you can specify one clustered index per table.
如果实际数据（行、文档、顶点）直接存储在索引结构中，则称为聚集索引。例如，在 MySQL 的 InnoDB 存储引擎中，表的主键始终是聚集索引，而在 SQL Server 中，您可以为每个表指定一个聚集索引。

Alternatively, the value can be a reference to the actual data: either the primary key of the row in question (InnoDB does this for secondary indexes), or a direct reference to a location on disk. In the latter case, the place where rows are stored is known as a heap file, and it stores data in no particular order (it may be append-only, or it may keep track of deleted rows in order to overwrite them with new data later). For example, Postgres uses the heap file approach [41].
另外，值可以是对实际数据的引用：要么是相关行的主键（InnoDB 为二级索引执行此操作），要么是对磁盘上位置的直接引用。在后一种情况下，存储行的地方称为堆文件，它以无特定顺序存储数据（它可能是仅追加的，或者可能跟踪已删除的行以便稍后用新数据覆盖它们）。例如，Postgres 使用堆文件方法 [ 41]。

A middle ground between the two is a covering index or index with included columns, which stores some of a table’s columns within the index, in addition to storing the full row on the heap or in the primary key clustered index [42]. This allows some queries to be answered by using the index alone, without having to resolve the primary key or look in the heap file (in which case, the index is said to cover the query). This can make some queries faster, but the duplication of data means the index uses more disk space and slows down writes.
两者之间的折中方案是覆盖索引或包含列的索引，它在索引中存储了表的一些列，此外还在堆或主键聚集索引中存储完整的行 [42]。这使得某些查询可以仅通过使用索引来回答，而无需解析主键或查找堆文件（在这种情况下，索引被称为覆盖查询）。这可以使某些查询更快，但数据的重复意味着索引占用更多的磁盘空间，并且会减慢写入速度。

The indexes discussed so far only map a single key to a value. If you need to query multiple columns of a table (or multiple fields in a document) simultaneously, see “Multidimensional and Full-Text Indexes”.
到目前为止讨论的索引仅将单个键映射到一个值。如果您需要同时查询表的多个列（或文档中的多个字段），请参见“多维和全文索引”。

When updating a value without changing the key, the heap file approach can allow the record to be overwritten in place, provided that the new value is not larger than the old value. The situation is more complicated if the new value is larger, as it probably needs to be moved to a new location in the heap where there is enough space. In that case, either all indexes need to be updated to point at the new heap location of the record, or a forwarding pointer is left behind in the old heap location [2].
在不更改键的情况下更新值时，堆文件方法可以允许记录就地覆盖，前提是新值不大于旧值。如果新值更大，情况就更复杂，因为它可能需要移动到堆中的新位置，以便有足够的空间。在这种情况下，要么需要更新所有索引以指向记录的新堆位置，要么在旧堆位置留下一个转发指针 [2]。

Keeping everything in memory
将所有内容保留在内存中

The data structures discussed so far in this chapter have all been answers to the limitations of disks. Compared to main memory, disks are awkward to deal with. With both magnetic disks and SSDs, data on disk needs to be laid out carefully if you want good performance on reads and writes. However, we tolerate this awkwardness because disks have two significant advantages: they are durable (their contents are not lost if the power is turned off), and they have a lower cost per gigabyte than RAM.
本章讨论的数据结构都是对磁盘限制的回应。与主内存相比，磁盘的处理相对麻烦。无论是磁盘还是 SSD，如果希望在读写时获得良好的性能，磁盘上的数据都需要仔细布局。然而，我们容忍这种麻烦，因为磁盘有两个显著的优势：它们是耐用的（如果断电，其内容不会丢失），并且每千兆字节的成本低于 RAM。

As RAM becomes cheaper, the cost-per-gigabyte argument is eroded. Many datasets are simply not that big, so it’s quite feasible to keep them entirely in memory, potentially distributed across several machines. This has led to the development of in-memory databases.
随着 RAM 变得更加便宜，每千兆字节的成本论点逐渐减弱。许多数据集实际上并没有那么大，因此将它们完全保存在内存中是相当可行的，可能分布在几台机器上。这导致了内存数据库的发展。

Some in-memory key-value stores, such as Memcached, are intended for caching use only, where it’s acceptable for data to be lost if a machine is restarted. But other in-memory databases aim for durability, which can be achieved with special hardware (such as battery-powered RAM), by writing a log of changes to disk, by writing periodic snapshots to disk, or by replicating the in-memory state to other machines.
一些内存键值存储，如 Memcached，仅用于缓存用途，在机器重启时数据丢失是可以接受的。但其他内存数据库则旨在实现持久性，这可以通过特殊硬件（如电池供电的 RAM）、将更改日志写入磁盘、定期将快照写入磁盘或将内存状态复制到其他机器来实现。

When an in-memory database is restarted, it needs to reload its state, either from disk or over the network from a replica (unless special hardware is used). Despite writing to disk, it’s still an in-memory database, because the disk is merely used as an append-only log for durability, and reads are served entirely from memory. Writing to disk also has operational advantages: files on disk can easily be backed up, inspected, and analyzed by external utilities.
当内存数据库重启时，它需要从磁盘或通过网络从副本重新加载其状态（除非使用了特殊硬件）。尽管写入磁盘，它仍然是一个内存数据库，因为磁盘仅用作持久性的追加日志，读取完全来自内存。写入磁盘也具有操作上的优势：磁盘上的文件可以轻松备份、检查和由外部工具分析。

Products such as VoltDB, SingleStore, and Oracle TimesTen are in-memory databases with a relational model, and the vendors claim that they can offer big performance improvements by removing all the overheads associated with managing on-disk data structures [43, 44]. RAMCloud is an open source, in-memory key-value store with durability (using a log-structured approach for the data in memory as well as the data on disk) [45]. Redis and Couchbase provide weak durability by writing to disk asynchronously.
像 VoltDB、SingleStore 和 Oracle TimesTen 这样的产品是具有关系模型的内存数据库，供应商声称通过消除与管理磁盘数据结构相关的所有开销，它们可以提供显著的性能提升 [ 43, 44]。RAMCloud 是一个开源的内存键值存储，具有持久性（使用日志结构的方法来处理内存中的数据以及磁盘上的数据） [ 45]。Redis 和 Couchbase 通过异步写入磁盘提供弱持久性。

Counterintuitively, the performance advantage of in-memory databases is not due to the fact that they don’t need to read from disk. Even a disk-based storage engine may never need to read from disk if you have enough memory, because the operating system caches recently used disk blocks in memory anyway. Rather, they can be faster because they can avoid the overheads of encoding in-memory data structures in a form that can be written to disk [46].
与直觉相反，内存数据库的性能优势并不是因为它们不需要从磁盘读取数据。即使是基于磁盘的存储引擎，如果内存足够，也可能永远不需要从磁盘读取，因为操作系统会将最近使用的磁盘块缓存到内存中。相反，它们之所以可以更快，是因为可以避免将内存数据结构编码为可以写入磁盘的形式所带来的开销 [ 46]。

Besides performance, another interesting area for in-memory databases is providing data models that are difficult to implement with disk-based indexes. For example, Redis offers a database-like interface to various data structures such as priority queues and sets. Because it keeps all data in memory, its implementation is comparatively simple.
除了性能，内存数据库的另一个有趣领域是提供难以通过基于磁盘的索引实现的数据模型。例如，Redis 提供了一个类似数据库的接口，可以用于各种数据结构，如优先队列和集合。由于它将所有数据保存在内存中，因此其实现相对简单。

Data Storage for Analytics
分析数据存储

The data model of a data warehouse is most commonly relational, because SQL is generally a good fit for analytic queries. There are many graphical data analysis tools that generate SQL queries, visualize the results, and allow analysts to explore the data (through operations such as drill-down and slicing and dicing).
数据仓库的数据模型通常是关系型的，因为 SQL 通常非常适合分析查询。有许多图形数据分析工具可以生成 SQL 查询，可视化结果，并允许分析师通过下钻、切片和切块等操作探索数据。

On the surface, a data warehouse and a relational OLTP database look similar, because they both have a SQL query interface. However, the internals of the systems can look quite different, because they are optimized for very different query patterns. Many database vendors now focus on supporting either transaction processing or analytics workloads, but not both.
表面上看，数据仓库和关系型 OLTP 数据库看起来相似，因为它们都有 SQL 查询接口。然而，这些系统的内部结构可能看起来非常不同，因为它们针对非常不同的查询模式进行了优化。许多数据库供应商现在专注于支持事务处理或分析工作负载，但不是两者兼顾。

Some databases, such as Microsoft SQL Server, SAP HANA, and SingleStore, have support for transaction processing and data warehousing in the same product. However, these hybrid transactional and analytical processing (HTAP) databases (introduced in “Data Warehousing”) are increasingly becoming two separate storage and query engines, which happen to be accessible through a common SQL interface [47, 48, 49, 50].
一些数据库，如 Microsoft SQL Server、SAP HANA 和 SingleStore，支持在同一产品中进行事务处理和数据仓库。然而，这些混合事务和分析处理（HTAP）数据库（在“数据仓库”中介绍）正日益成为两个独立的存储和查询引擎，这些引擎恰好可以通过一个共同的 SQL 接口访问 [ 47, 48, 49, 50 ]。

Cloud Data Warehouses
云数据仓库

Data warehouse vendors such as Teradata, Vertica, and SAP HANA sell both on-premises warehouses under commercial licenses and cloud-based solutions. But as many of their customers move to the cloud, new cloud data warehouses such as Google Cloud BigQuery, Amazon Redshift, and Snowflake have also become widely adopted. Unlike traditional data warehouses, cloud data warehouses take advantage of scalable cloud infrastructure like object storage and serverless computation platforms.
数据仓库供应商如 Teradata、Vertica 和 SAP HANA 在商业许可证下销售本地仓库和基于云的解决方案。但随着许多客户转向云，新兴的云数据仓库如 Google Cloud BigQuery、Amazon Redshift 和 Snowflake 也得到了广泛采用。与传统数据仓库不同，云数据仓库利用可扩展的云基础设施，如对象存储和无服务器计算平台。

Cloud data warehouses tend to integrate better with other cloud services and to be more elastic. For example, many cloud warehouses support automatic log ingestion, and offer easy integration with data processing frameworks such as Google Cloud’s Dataflow or Amazon Web Services’ Kinesis. These warehouses are also more elastic because they decouple query computation from the storage layer [51]. Data is persisted on object storage rather than local disks, which makes it easy to adjust storage capacity and compute resources for queries independently, as we previously saw in “Cloud-Native System Architecture”.
云数据仓库往往与其他云服务的集成更好，并且更具弹性。例如，许多云仓库支持自动日志摄取，并提供与数据处理框架（如 Google Cloud 的 Dataflow 或 Amazon Web Services 的 Kinesis）的简单集成。这些仓库也更具弹性，因为它们将查询计算与存储层解耦 [51]。数据保存在对象存储上，而不是本地磁盘，这使得我们可以独立地调整存储容量和查询的计算资源，正如我们之前在“云原生系统架构”中看到的那样。

Open source data warehouses such as Apache Hive, Trino, and Apache Spark have also evolved with the cloud. As data storage for analytics has moved to data lakes on object storage, open source warehouses have begun to break apart [52]. The following components, which were previously integrated in a single system such as Apache Hive, are now often implemented as separate components:
开源数据仓库如 Apache Hive、Trino 和 Apache Spark 也随着云的发展而演变。随着分析数据存储转向对象存储上的数据湖，开源仓库开始分拆 [52]。以下组件，之前在像 Apache Hive 这样的单一系统中集成，现在通常作为独立组件实现：

Query engine
查询引擎
Query engines such as Trino, Apache DataFusion, and Presto parse SQL queries, optimize them into execution plans, and execute them against the data. Execution usually requires parallel, distributed data processing tasks. Some query engines provide built-in task execution, while others choose to use third party execution frameworks such as Apache Spark or Apache Flink.
查询引擎如 Trino、Apache DataFusion 和 Presto 解析 SQL 查询，将其优化为执行计划，并在数据上执行这些计划。执行通常需要并行的分布式数据处理任务。一些查询引擎提供内置的任务执行，而其他则选择使用第三方执行框架，如 Apache Spark 或 Apache Flink。

Storage format
存储格式
The storage format determines how the rows of a table are encoded as bytes in a file, which is then typically stored in object storage or a distributed filesystem [12]. This data can then be accessed by the query engine, but also by other applications using the data lake. Examples of such storage formats are Parquet, ORC, Lance, or Nimble, and we will see more about them in the next section.
存储格式决定了表的行如何编码为文件中的字节，这些文件通常存储在对象存储或分布式文件系统中 [12]。这些数据可以被查询引擎访问，也可以被使用数据湖的其他应用程序访问。这些存储格式的例子包括 Parquet、ORC、Lance 或 Nimble，我们将在下一节中看到更多关于它们的信息。

Table format
表格式
Files written in Apache Parquet and similar storage formats are typically immutable once written. To support row inserts and deletions, a table format such as Apache Iceberg or Databricks’s Delta format are used. Table formats specify a file format that defines which files constitute a table along with the table’s schema. Such formats also offer advanced features such as time travel (the ability to query a table as it was at a previous point in time), garbage collection, and even transactions.
用 Apache Parquet 和类似存储格式写入的文件在写入后通常是不可变的。为了支持行的插入和删除，使用像 Apache Iceberg 或 Databricks 的 Delta 格式这样的表格式。表格式指定了一种文件格式，定义了哪些文件构成一个表以及该表的模式。这些格式还提供了高级功能，如时间旅行（能够查询表在过去某个时间点的状态）、垃圾回收，甚至事务。

Data catalog
数据目录
Much like a table format defines which files make up a table, a data catalog defines which tables comprise a database. Catalogs are used to create, rename, and drop tables. Unlike storage and table formats, data catalogs such as Snowflake’s Polaris and Databricks’s Unity Catalog usually run as a standalone service that can be queried using a REST interface. Apache Iceberg also offers a catalog, which can be run inside a client or as a separate process. Query engines use catalog information when reading and writing tables. Traditionally, catalogs and query engines have been integrated, but decoupling them has enabled data discovery and data governance systems (discussed in “Data Systems, Law, and Society”) to access a catalog’s metadata as well.
就像表格格式定义了哪些文件构成一个表一样，数据目录定义了哪些表构成一个数据库。目录用于创建、重命名和删除表。与存储和表格格式不同，像 Snowflake 的 Polaris 和 Databricks 的 Unity Catalog 这样的数据目录通常作为独立服务运行，可以通过 REST 接口进行查询。Apache Iceberg 也提供了一个目录，可以在客户端内部运行或作为单独的进程运行。查询引擎在读取和写入表时使用目录信息。传统上，目录和查询引擎是集成在一起的，但将它们解耦使得数据发现和数据治理系统（在“数据系统、法律与社会”中讨论）也能够访问目录的元数据。

Column-Oriented Storage
列式存储

As discussed in “Stars and Snowflakes: Schemas for Analytics”, data warehouses by convention often use a relational schema with a big fact table that contains foreign key references into dimension tables. If you have trillions of rows and petabytes of data in your fact tables, storing and querying them efficiently becomes a challenging problem. Dimension tables are usually much smaller (millions of rows), so in this section we will focus on storage of facts.
正如在“星型和雪花型：分析的模式”中讨论的，数据仓库通常使用关系模式，包含一个大的事实表，该表包含对维度表的外键引用。如果你的事实表中有万亿行和数 PB 的数据，如何高效地存储和查询这些数据就成了一个挑战性的问题。维度表通常要小得多（数百万行），因此在本节中我们将重点关注事实的存储。

Although fact tables are often over 100 columns wide, a typical data warehouse query only accesses 4 or 5 of them at one time ("SELECT _" queries are rarely needed for analytics) [49]. Take the query in Example 4-1: it accesses a large number of rows (every occurrence of someone buying fruit or candy during the 2024 calendar year), but it only needs to access three columns of the fact_sales table: date_key, product_sk, and quantity. The query ignores all other columns.
尽管事实表通常有超过 100 列，但典型的数据仓库查询一次只访问其中的 4 或 5 列（ "SELECT _" 查询在分析中很少需要）[49]。以示例 4-1 中的查询为例：它访问了大量行（2024 年日历年中每次有人购买水果或糖果的记录），但只需要访问 fact_sales 表中的三列： date_key 、 product_sk 和 quantity 。该查询忽略了所有其他列。

Example 4-1. Analyzing whether people are more inclined to buy fresh fruit or candy, depending on the day of the week
示例 4-1. 分析人们在一周的不同日子中更倾向于购买新鲜水果还是糖果

SELECT
dim_date.weekday, dim_product.category,
SUM(fact_sales.quantity) AS quantity_sold
FROM fact_sales
JOIN dim_date ON fact_sales.date_key = dim_date.date_key
JOIN dim_product ON fact_sales.product_sk = dim_product.product_sk
WHERE
dim_date.year = 2024 AND
dim_product.category IN ('Fresh fruit', 'Candy')
GROUP BY
dim_date.weekday, dim_product.category;
How can we execute this query efficiently?
我们如何高效地执行这个查询？

In most OLTP databases, storage is laid out in a row-oriented fashion: all the values from one row of a table are stored next to each other. Document databases are similar: an entire document is typically stored as one contiguous sequence of bytes. You can see this in the CSV example of Figure 4-1.
在大多数 OLTP 数据库中，存储是以行导向的方式布局的：表中一行的所有值是相邻存储的。文档数据库也是类似的：整个文档通常作为一个连续的字节序列存储。你可以在图 4-1 的 CSV 示例中看到这一点。

In order to process a query like Example 4-1, you may have indexes on fact_sales.date_key and/or fact_sales.product_sk that tell the storage engine where to find all the sales for a particular date or for a particular product. But then, a row-oriented storage engine still needs to load all of those rows (each consisting of over 100 attributes) from disk into memory, parse them, and filter out those that don’t meet the required conditions. That can take a long time.
为了处理像示例 4-1 这样的查询，你可能在 fact_sales.date_key 和/或 fact_sales.product_sk 上有索引，这些索引告诉存储引擎在哪里找到特定日期或特定产品的所有销售记录。但是，行导向的存储引擎仍然需要将所有这些行（每行包含超过 100 个属性）从磁盘加载到内存中，解析它们，并过滤掉那些不符合要求条件的行。这可能需要很长时间。

The idea behind column-oriented (or columnar) storage is simple: don’t store all the values from one row together, but store all the values from each column together instead [53]. If each column is stored separately, a query only needs to read and parse those columns that are used in that query, which can save a lot of work. Figure 4-7 shows this principle using an expanded version of the fact table from Figure 3-5.
列导向（或列式）存储的理念很简单：不要将一行的所有值一起存储，而是将每列的所有值一起存储。如果每列单独存储，查询只需要读取和解析在该查询中使用的那些列，这可以节省大量工作。图 4-7 使用图 3-5 中事实表的扩展版本展示了这一原则。

Note
注意

Column storage is easiest to understand in a relational data model, but it applies equally to nonrelational data. For example, Parquet [54] is a columnar storage format that supports a document data model, based on Google’s Dremel [55], using a technique known as shredding or striping [56].
列存储在关系数据模型中最容易理解，但它同样适用于非关系数据。例如，Parquet [ 54] 是一种列式存储格式，支持基于 Google 的 Dremel [ 55] 的文档数据模型，使用一种称为 shredding 或 striping [ 56] 的技术。

ddia 0407
Figure 4-7. Storing relational data by column, rather than by row.
图 4-7. 按列而不是按行存储关系数据。

The column-oriented storage layout relies on each column storing the rows in the same order. Thus, if you need to reassemble an entire row, you can take the 23rd entry from each of the individual columns and put them together to form the 23rd row of the table.
列导向的存储布局依赖于每一列以相同的顺序存储行。因此，如果您需要重新组装整行，可以从每个单独的列中取出第 23 个条目，并将它们组合在一起形成表的第 23 行。

In fact, columnar storage engines don’t actually store an entire column (containing perhaps trillions of rows) in one go. Instead, they break the table into blocks of thousands or millions of rows, and within each block they store the values from each column separately [57]. Since many queries are restricted to a particular date range, it is common to make each block contain the rows for a particular timestamp range. A query then only needs to load the columns it needs in those blocks that overlap with the required date range.
事实上，列式存储引擎并不会一次性存储整个列（可能包含数万亿行）。相反，它们将表分解为数千或数百万行的块，并在每个块内分别存储每列的值 [ 57]。由于许多查询限制在特定的日期范围内，因此通常会使每个块包含特定时间戳范围的行。查询只需加载在与所需日期范围重叠的块中所需的列。

Columnar storage is used in almost all analytic databases nowadays [57], ranging from large-scale cloud data warehouses such as Snowflake [58] to single-node embedded databases such as DuckDB [59], and product analytics systems such as Pinot [60] and Druid [61]. It is used in storage formats such as Parquet, ORC [62, 63], Lance [64], and Nimble [65], and in-memory analytics formats like Apache Arrow [62, 66] and Pandas/NumPy [67]. Some time-series databases, such as InfluxDB IOx [68] and TimescaleDB [69], are also based on column-oriented storage.
列式存储如今几乎在所有分析数据库中都得到了应用 [57]，从大型云数据仓库如 Snowflake [58] 到单节点嵌入式数据库如 DuckDB [59]，以及产品分析系统如 Pinot [60] 和 Druid [61]。它被用于存储格式如 Parquet、ORC [62, 63]、Lance [64] 和 Nimble [65]，以及内存分析格式如 Apache Arrow [62, 66] 和 Pandas/NumPy [67]。一些时间序列数据库，如 InfluxDB IOx [68] 和 TimescaleDB [69]，也基于列式存储。

Column Compression
列压缩

Besides only loading those columns from disk that are required for a query, we can further reduce the demands on disk throughput and network bandwidth by compressing data. Fortunately, column-oriented storage often lends itself very well to compression.
除了仅从磁盘加载查询所需的列外，我们还可以通过压缩数据进一步减少对磁盘吞吐量和网络带宽的需求。幸运的是，列式存储通常非常适合压缩。

Take a look at the sequences of values for each column in Figure 4-7: they often look quite repetitive, which is a good sign for compression. Depending on the data in the column, different compression techniques can be used. One technique that is particularly effective in data warehouses is bitmap encoding, illustrated in Figure 4-8.
看看图 4-7 中每列的值序列：它们往往看起来相当重复，这对压缩来说是一个好兆头。根据列中的数据，可以使用不同的压缩技术。在数据仓库中，一种特别有效的技术是位图编码，如图 4-8 所示。

ddia 0408
Figure 4-8. Compressed, bitmap-indexed storage of a single column.
图 4-8. 单列的压缩位图索引存储。

Often, the number of distinct values in a column is small compared to the number of rows (for example, a retailer may have billions of sales transactions, but only 100,000 distinct products). We can now take a column with n distinct values and turn it into n separate bitmaps: one bitmap for each distinct value, with one bit for each row. The bit is 1 if the row has that value, and 0 if not.
通常，列中的不同值数量与行数相比是很小的（例如，一个零售商可能有数十亿的销售交易，但只有 100,000 个不同的产品）。我们现在可以将一个具有 n 个不同值的列转换为 n 个单独的位图：每个不同值一个位图，每行一个位。该位为 1 表示该行具有该值，为 0 则表示没有。

One option is to store those bitmaps using one bit per row. However, these bitmaps typically contain a lot of zeros (we say that they are sparse). In that case, the bitmaps can additionally be run-length encoded: counting the number of consecutive zeros or ones and storing that number, as shown at the bottom of Figure 4-8. Techniques such as roaring bitmaps switch between the two bitmap representations, using whichever is the most compact [70]. This can make the encoding of a column remarkably efficient.
一种选择是使用每行一个位来存储这些位图。然而，这些位图通常包含大量的零（我们称之为稀疏）。在这种情况下，位图还可以进行游程编码：计算连续的零或一的数量并存储该数量，如图 4-8 底部所示。像咆哮位图这样的技术在两种位图表示之间切换，使用最紧凑的表示方式[70]。这可以使列的编码变得非常高效。

Bitmap indexes such as these are very well suited for the kinds of queries that are common in a data warehouse. For example:
这样的位图索引非常适合数据仓库中常见的查询类型。例如：

WHERE product_sk IN (31, 68, 69):
Load the three bitmaps for product_sk = 31, product_sk = 68, and product_sk = 69, and calculate the bitwise OR of the three bitmaps, which can be done very efficiently.
加载 product_sk = 31 、 product_sk = 68 和 product_sk = 69 的三个位图，并计算这三个位图的按位或，这可以非常高效地完成。

WHERE product_sk = 30 AND store_sk = 3:
Load the bitmaps for product_sk = 30 and store_sk = 3, and calculate the bitwise AND. This works because the columns contain the rows in the same order, so the kth bit in one column’s bitmap corresponds to the same row as the kth bit in another column’s bitmap.
加载 product_sk = 30 和 store_sk = 3 的位图，并计算按位与。这是可行的，因为列中的行是按相同顺序排列的，因此一列位图中的第 k 位对应于另一列位图中相同的行的第 k 位。

Bitmaps can also be used to answer graph queries, such as finding all users of a social network who are followed by user X and who also follow user Y [71]. There are also various other compression schemes for columnar databases, which you can find in the references [72].
位图也可以用于回答图查询，例如查找社交网络中被用户 X 关注且同时关注用户 Y 的所有用户 [71]。对于列式数据库，还有各种其他压缩方案，您可以在参考文献 [72] 中找到。

Note
注意

Don’t confuse column-oriented databases with the wide-column (also known as column-family) data model, in which a row can have thousands of columns, and there is no need for all the rows to have the same columns [9]. Despite the similarity in name, wide-column databases are row-oriented, since they store all values from a row together. Google’s Bigtable, Apache Accumulo, and HBase are examples of the wide-column model.
不要将列式数据库与宽列（也称为列族）数据模型混淆，在这种模型中，一行可以有数千列，并且所有行不需要具有相同的列 [9]。尽管名称相似，宽列数据库是面向行的，因为它们将来自同一行的所有值存储在一起。Google 的 Bigtable、Apache Accumulo 和 HBase 是宽列模型的例子。

Sort Order in Column Storage
列存储中的排序顺序

In a column store, it doesn’t necessarily matter in which order the rows are stored. It’s easiest to store them in the order in which they were inserted, since then inserting a new row just means appending to each of the columns. However, we can choose to impose an order, like we did with SSTables previously, and use that as an indexing mechanism.
在列存储中，行的存储顺序并不一定重要。最简单的方式是按照插入的顺序存储它们，因为这样插入新行只需在每一列后追加即可。然而，我们可以选择施加一个顺序，就像我们之前对 SSTables 所做的那样，并将其用作索引机制。

Note that it wouldn’t make sense to sort each column independently, because then we would no longer know which items in the columns belong to the same row. We can only reconstruct a row because we know that the kth item in one column belongs to the same row as the kth item in another column.
请注意，独立对每一列进行排序是没有意义的，因为那样我们将无法知道列中的哪些项属于同一行。我们只能重建一行，因为我们知道某一列中的第 k 项与另一列中的第 k 项属于同一行。

Rather, the data needs to be sorted an entire row at a time, even though it is stored by column. The administrator of the database can choose the columns by which the table should be sorted, using their knowledge of common queries. For example, if queries often target date ranges, such as the last month, it might make sense to make date_key the first sort key. Then the query can scan only the rows from the last month, which will be much faster than scanning all rows.
相反，数据需要按整行进行排序，尽管它是按列存储的。数据库管理员可以选择表格应按哪些列进行排序，利用他们对常见查询的了解。例如，如果查询经常针对日期范围，如上个月，那么将 date_key 作为第一个排序键可能是合理的。这样，查询只需扫描上个月的行，这比扫描所有行要快得多。

A second column can determine the sort order of any rows that have the same value in the first column. For example, if date_key is the first sort key in Figure 4-7, it might make sense for product_sk to be the second sort key so that all sales for the same product on the same day are grouped together in storage. That will help queries that need to group or filter sales by product within a certain date range.
第二列可以确定任何在第一列中具有相同值的行的排序顺序。例如，如果 date_key 是图 4-7 中的第一个排序键，那么将 product_sk 作为第二个排序键可能是合理的，这样同一天的同一产品的所有销售记录就会在存储中分组在一起。这将有助于需要在特定日期范围内按产品对销售进行分组或过滤的查询。

Another advantage of sorted order is that it can help with compression of columns. If the primary sort column does not have many distinct values, then after sorting, it will have long sequences where the same value is repeated many times in a row. A simple run-length encoding, like we used for the bitmaps in Figure 4-8, could compress that column down to a few kilobytes—even if the table has billions of rows.
另一个排序顺序的优点是它可以帮助压缩列。如果主排序列的不同值不多，那么在排序后，它将会有长序列，其中相同的值连续重复多次。像我们在图 4-8 中对位图使用的简单游程编码，可以将该列压缩到几千字节——即使表中有数十亿行。

That compression effect is strongest on the first sort key. The second and third sort keys will be more jumbled up, and thus not have such long runs of repeated values. Columns further down the sorting priority appear in essentially random order, so they probably won’t compress as well. But having the first few columns sorted is still a win overall.
这种压缩效果在第一个排序键上最强。第二和第三个排序键会更加杂乱，因此不会有如此长的重复值序列。排序优先级较低的列基本上以随机顺序出现，因此它们的压缩效果可能不如前面的列。但将前几列进行排序总体上仍然是一个优势。

Writing to Column-Oriented Storage
写入列式存储

We saw in “Characterizing Transaction Processing and Analytics” that reads in data warehouses tend to consist of aggregations over a large number of rows; column-oriented storage, compression, and sorting all help to make those read queries faster. Writes in a data warehouse tend to be a bulk import of data, often via an ETL process.
我们在“特征化事务处理和分析”中看到，数据仓库中的读取通常是对大量行的聚合；列式存储、压缩和排序都帮助加快这些读取查询。在数据仓库中的写入往往是数据的批量导入，通常通过 ETL 过程进行。

With columnar storage, writing an individual row somewhere in the middle of a sorted table would be very inefficient, as you would have to rewrite all the compressed columns from the insertion position onwards. However, a bulk write of many rows at once amortizes the cost of rewriting those columns, making it efficient.
使用列式存储，在已排序表的中间写入单个行会非常低效，因为您必须从插入位置开始重写所有压缩列。然而，一次性批量写入多行可以摊销重写这些列的成本，从而提高效率。

A log-structured approach is often used to perform writes in batches. All writes first go to a row-oriented, sorted, in-memory store. When enough writes have accumulated, they are merged with the column-encoded files on disk and written to new files in bulk. As old files remain immutable, and new files are written in one go, object storage is well suited for storing these files.
日志结构的方法通常用于批量写入。所有写入首先进入一个面向行的、已排序的内存存储。当累积到足够的写入时，它们会与磁盘上的列编码文件合并，并批量写入新文件。由于旧文件保持不变，而新文件一次性写入，因此对象存储非常适合存储这些文件。

Queries need to examine both the column data on disk and the recent writes in memory, and combine the two. The query execution engine hides this distinction from the user. From an analyst’s point of view, data that has been modified with inserts, updates, or deletes is immediately reflected in subsequent queries. Snowflake, Vertica, Apache Pinot, Apache Druid, and many others do this [58, 60, 61, 73].
查询需要同时检查磁盘上的列数据和内存中的最近写入，并将两者结合起来。查询执行引擎将这种区别隐藏在用户面前。从分析师的角度来看，经过插入、更新或删除修改的数据会立即反映在后续查询中。Snowflake、Vertica、Apache Pinot、Apache Druid 等许多系统都这样做 [ 58, 60, 61, 73]。

Query Execution: Compilation and Vectorization
查询执行：编译和向量化

A complex SQL query for analytics is broken down into a query plan consisting of multiple stages, called operators, which may be distributed across multiple machines for parallel execution. Query planners can perform a lot of optimizations by choosing which operators to use, in which order to perform them, and where to run each operator.
一个复杂的 SQL 查询用于分析时被分解为一个查询计划，该计划由多个阶段组成，这些阶段称为操作符，可能分布在多台机器上以进行并行执行。查询规划器可以通过选择使用哪些操作符、以何种顺序执行它们以及在哪里运行每个操作符来进行大量优化。

Within each operator, the query engine needs to do various things with the values in a column, such as finding all the rows where the value is among a particular set of values (perhaps as part of a join), or checking whether the value is greater than 15. It also needs to look at several columns for the same row, for example to find all sales transactions where the product is bananas and the store is a particular store of interest.
在每个操作符内，查询引擎需要对列中的值执行各种操作，例如查找所有值在特定值集合中的行（可能作为连接的一部分），或检查值是否大于 15。它还需要查看同一行的多个列，例如查找所有销售交易，其中产品是香蕉且商店是特定的关注商店。

For data warehouse queries that need to scan over millions of rows, we need to worry not only about the amount of data they need to read off disk, but also the CPU time required to execute complex operators. The simplest kind of operator is like an interpreter for a programming language: while iterating over each row, it checks a data structure representing the query to find out which comparisons or calculations it needs to perform on which columns. Unfortunately, this is too slow for many analytics purposes. Two alternative approaches for efficient query execution have emerged [74]:
对于需要扫描数百万行的数据仓库查询，我们不仅需要关注它们从磁盘读取的数据量，还需要考虑执行复杂操作所需的 CPU 时间。最简单的操作符就像编程语言的解释器：在遍历每一行时，它检查一个表示查询的数据结构，以找出需要在哪些列上执行哪些比较或计算。不幸的是，这对于许多分析目的来说太慢了。为高效查询执行出现了两种替代方法 [ 74 ]：

Query compilation
查询编译
The query engine takes the SQL query and generates code for executing it. The code iterates over the rows one by one, looks at the values in the columns of interest, performs whatever comparisons or calculations are needed, and copies the necessary values to an output buffer if the required conditions are satisfied. The query engine compiles the generated code to machine code (often using an existing compiler such as LLVM), and then runs it on the column-encoded data that has been loaded into memory. This approach to code generation is similar to the just-in-time (JIT) compilation approach that is used in the Java Virtual Machine (JVM) and similar runtimes.
查询引擎接收 SQL 查询并生成执行代码。该代码逐行迭代，查看感兴趣列中的值，执行所需的比较或计算，并在满足条件时将必要的值复制到输出缓冲区。查询引擎将生成的代码编译为机器代码（通常使用现有的编译器，如 LLVM），然后在已加载到内存中的列编码数据上运行。此代码生成方法类似于在 Java 虚拟机（JVM）和类似运行时中使用的即时编译（JIT）方法。

Vectorized processing
向量化处理
The query is interpreted, not compiled, but it is made fast by processing many values from a column in a batch, instead of iterating over rows one by one. A fixed set of predefined operators are built into the database; we can pass arguments to them and get back a batch of results [47, 72].
查询是被解释的，而不是编译的，但通过批量处理列中的多个值来加快速度，而不是逐行迭代。数据库内置了一组固定的预定义运算符；我们可以向它们传递参数并返回一批结果 [ 47, 72]。

For example, we could pass the product_sk column and the ID of “bananas” to an equality operator, and get back a bitmap (one bit per value in the input column, which is 1 if it’s a banana); we could then pass the store_sk column and the ID of the store of interest to the same equality operator, and get back another bitmap; and then we could pass the two bitmaps to a “bitwise AND” operator, as shown in Figure 4-9. The result would be a bitmap containing a 1 for all sales of bananas in a particular store.
例如，我们可以将 product_sk 列和“香蕉”的 ID 传递给一个等式运算符，并返回一个位图（输入列中每个值对应一个位，如果是香蕉则为 1）；然后我们可以将 store_sk 列和感兴趣商店的 ID 传递给同一个等式运算符，并返回另一个位图；接着我们可以将这两个位图传递给一个“按位与”运算符，如图 4-9 所示。结果将是一个位图，包含特定商店中所有香蕉销售的 1。

ddia 0409
Figure 4-9. A bitwise AND between two bitmaps lends itself to vectorization.
图 4-9. 两个位图之间的按位与运算适合向量化。

The two approaches are very different in terms of their implementation, but both are used in practice [74]. Both can achieve very good performance by taking advantages of the characteristics of modern CPUs:
这两种方法在实现上非常不同，但在实践中都被使用[74]。两者都可以通过利用现代 CPU 的特性来实现非常好的性能：

preferring sequential memory access over random access to reduce cache misses [75],
更倾向于顺序内存访问而非随机访问，以减少缓存未命中[75]，

doing most of the work in tight inner loops (that is, with a small number of instructions and no function calls) to keep the CPU instruction processing pipeline busy and avoid branch mispredictions,
在紧密的内循环中完成大部分工作（即，使用少量指令且不进行函数调用），以保持 CPU 指令处理流水线的忙碌并避免分支预测错误，

making use of parallelism such as multiple threads and single-instruction-multi-data (SIMD) instructions [76, 77], and
利用并行性，例如多个线程和单指令多数据（SIMD）指令 [ 76, 77]，以及

operating directly on compressed data without decoding it into a separate in-memory representation, which saves memory allocation and copying costs.
直接在压缩数据上操作，而不将其解码为单独的内存表示，这样可以节省内存分配和复制成本。

Materialized Views and Data Cubes
物化视图和数据立方体

We previously encountered materialized views in “Materializing and Updating Timelines”: in a relational data model, they are table-like object whose contents are the results of some query. The difference is that a materialized view is an actual copy of the query results, written to disk, whereas a virtual view is just a shortcut for writing queries. When you read from a virtual view, the SQL engine expands it into the view’s underlying query on the fly and then processes the expanded query.
我们之前在“物化和更新时间线”中遇到过物化视图：在关系数据模型中，它们是类似表的对象，其内容是某些查询的结果。不同之处在于，物化视图是查询结果的实际副本，写入磁盘，而虚拟视图只是编写查询的快捷方式。当你从虚拟视图读取时，SQL 引擎会即时将其扩展为视图的基础查询，然后处理扩展后的查询。

When the underlying data changes, a materialized view needs to be updated accordingly. Some databases can do that automatically, and there are also systems such as Materialize that specialize in materialized view maintenance [78]. Performing such updates means more work on writes, but materialized views can improve read performance in workloads that repeatedly need to perform the same queries.
当基础数据发生变化时，物化视图需要相应地更新。一些数据库可以自动完成这一点，还有一些系统，如 Materialize，专门从事物化视图的维护 [ 78]。执行这样的更新意味着写入时需要更多的工作，但物化视图可以提高在重复执行相同查询的工作负载中的读取性能。

Materialized aggregates are a type of materialized views that can be useful in data warehouses. As discussed earlier, data warehouse queries often involve an aggregate function, such as COUNT, SUM, AVG, MIN, or MAX in SQL. If the same aggregates are used by many different queries, it can be wasteful to crunch through the raw data every time. Why not cache some of the counts or sums that queries use most often? A data cube or OLAP cube does this by creating a grid of aggregates grouped by different dimensions [79]. Figure 4-10 shows an example.
物化聚合是一种物化视图，在数据仓库中非常有用。如前所述，数据仓库查询通常涉及聚合函数，例如 SQL 中的 COUNT 、 SUM 、 AVG 、 MIN 或 MAX 。如果许多不同的查询使用相同的聚合，那么每次都从原始数据中计算这些聚合将是浪费。为什么不缓存一些查询最常用的计数或总和呢？数据立方体或 OLAP 立方体通过创建一个按不同维度分组的聚合网格来实现这一点 [79]。图 4-10 显示了一个示例。

ddia 0410
Figure 4-10. Two dimensions of a data cube, aggregating data by summing.
图 4-10. 数据立方体的两个维度，通过求和聚合数据。

Imagine for now that each fact has foreign keys to only two dimension tables—in Figure 4-10, these are date_key and product_sk. You can now draw a two-dimensional table, with dates along one axis and products along the other. Each cell contains the aggregate (e.g., SUM) of an attribute (e.g., net_price) of all facts with that date-product combination. Then you can apply the same aggregate along each row or column and get a summary that has been reduced by one dimension (the sales by product regardless of date, or the sales by date regardless of product).
现在假设每个事实只与两个维度表有外键关系——在图 4-10 中，这些是 date_key 和 product_sk 。您现在可以绘制一个二维表格，一条轴上是日期，另一条轴上是产品。每个单元格包含所有具有该日期-产品组合的事实的一个属性（例如， net_price ）的聚合（例如， SUM ）。然后，您可以沿着每一行或每一列应用相同的聚合，从而获得一个减少了一个维度的摘要（无论日期的产品销售，或无论产品的日期销售）。

In general, facts often have more than two dimensions. In Figure 3-5 there are five dimensions: date, product, store, promotion, and customer. It’s a lot harder to imagine what a five-dimensional hypercube would look like, but the principle remains the same: each cell contains the sales for a particular date-product-store-promotion-customer combination. These values can then repeatedly be summarized along each of the dimensions.
一般来说，事实通常具有超过两个维度。在图 3-5 中，有五个维度：日期、产品、商店、促销和客户。想象一个五维超立方体的样子要困难得多，但原则是相同的：每个单元格包含特定日期-产品-商店-促销-客户组合的销售额。这些值可以沿着每个维度反复进行汇总。

The advantage of a materialized data cube is that certain queries become very fast because they have effectively been precomputed. For example, if you want to know the total sales per store yesterday, you just need to look at the totals along the appropriate dimension—no need to scan millions of rows.
物化数据立方体的优势在于某些查询变得非常快速，因为它们实际上已经被预计算。例如，如果你想知道昨天每个商店的总销售额，你只需查看相应维度的总数——无需扫描数百万行。

The disadvantage is that a data cube doesn’t have the same flexibility as querying the raw data. For example, there is no way of calculating which proportion of sales comes from items that cost more than $100, because the price isn’t one of the dimensions. Most data warehouses therefore try to keep as much raw data as possible, and use aggregates such as data cubes only as a performance boost for certain queries.
缺点是数据立方体没有像查询原始数据那样的灵活性。例如，无法计算销售中有多少比例来自于价格超过 100 美元的商品，因为价格并不是其中一个维度。因此，大多数数据仓库尽量保留尽可能多的原始数据，并仅将聚合（如数据立方体）用作某些查询的性能提升。

Multidimensional and Full-Text Indexes
多维和全文索引

The B-trees and LSM-trees we saw in the first half of this chapter allow range queries over a single attribute: for example, if the key is a username, you can use them as an index to efficiently find all names starting with an L. But sometimes, searching by a single attribute is not enough.
我们在本章前半部分看到的 B 树和 LSM 树允许对单个属性进行范围查询：例如，如果键是用户名，您可以将它们用作索引，以高效地找到所有以 L 开头的名称。但有时，仅通过单个属性进行搜索是不够的。

The most common type of multi-column index is called a concatenated index, which simply combines several fields into one key by appending one column to another (the index definition specifies in which order the fields are concatenated). This is like an old-fashioned paper phone book, which provides an index from (lastname, firstname) to phone number. Due to the sort order, the index can be used to find all the people with a particular last name, or all the people with a particular lastname-firstname combination. However, the index is useless if you want to find all the people with a particular first name.
最常见的多列索引类型称为连接索引，它通过将一个字段附加到另一个字段来简单地将几个字段组合成一个键（索引定义指定字段连接的顺序）。这就像一本老式的纸质电话簿，它提供了从（姓，名）到电话号码的索引。由于排序顺序，该索引可以用来查找所有具有特定姓氏的人，或所有具有特定姓氏-名字组合的人。然而，如果您想查找所有具有特定名字的人，则该索引就毫无用处。

On the other hand, multi-dimensional indexes allow you to query several columns at once. One case where this is particularly important is geospatial data. For example, a restaurant-search website may have a database containing the latitude and longitude of each restaurant. When a user is looking at the restaurants on a map, the website needs to search for all the restaurants within the rectangular map area that the user is currently viewing. This requires a two-dimensional range query like the following:
另一方面，多维索引允许您一次查询多个列。这在地理空间数据中尤为重要。例如，一个餐厅搜索网站可能有一个数据库，包含每个餐厅的纬度和经度。当用户在地图上查看餐厅时，网站需要搜索用户当前查看的矩形地图区域内的所有餐厅。这需要一个二维范围查询，如下所示：

SELECT \* FROM restaurants WHERE latitude > 51.4946 AND latitude < 51.5079
AND longitude > -0.1162 AND longitude < -0.1004;
A concatenated index over the latitude and longitude columns is not able to answer that kind of query efficiently: it can give you either all the restaurants in a range of latitudes (but at any longitude), or all the restaurants in a range of longitudes (but anywhere between the North and South poles), but not both simultaneously.
对纬度和经度列的连接索引无法有效地回答这种查询：它可以给您一个纬度范围内的所有餐厅（但在任何经度上），或者一个经度范围内的所有餐厅（但在南北极之间的任何地方），但不能同时满足这两者。

One option is to translate a two-dimensional location into a single number using a space-filling curve, and then to use a regular B-tree index [80]. More commonly, specialized spatial indexes such as R-trees or Bkd-trees [81] are used; they divide up the space so that nearby data points tend to be grouped in the same subtree. For example, PostGIS implements geospatial indexes as R-trees using PostgreSQL’s Generalized Search Tree indexing facility [82]. It is also possible to use regularly spaced grids of triangles, squares, or hexagons [83].
一种选择是使用空间填充曲线将二维位置转换为单个数字，然后使用常规的 B 树索引 [80]。更常见的是使用专门的空间索引，如 R 树或 Bkd 树 [81]；它们将空间划分，使得相邻的数据点倾向于被分组在同一个子树中。例如，PostGIS 使用 PostgreSQL 的广义搜索树索引功能实现了作为 R 树的地理空间索引 [82]。还可以使用规则间隔的三角形、正方形或六边形网格 [83]。

Multi-dimensional indexes are not just for geographic locations. For example, on an ecommerce website you could use a three-dimensional index on the dimensions (red, green, blue) to search for products in a certain range of colors, or in a database of weather observations you could have a two-dimensional index on (date, temperature) in order to efficiently search for all the observations during the year 2013 where the temperature was between 25 and 30℃. With a one-dimensional index, you would have to either scan over all the records from 2013 (regardless of temperature) and then filter them by temperature, or vice versa. A 2D index could narrow down by timestamp and temperature simultaneously [84].
多维索引不仅仅用于地理位置。例如，在一个电子商务网站上，你可以使用一个三维索引来搜索某一范围颜色的产品，维度为（红色、绿色、蓝色）；或者在一个天气观测数据库中，你可以在（日期、温度）上建立一个二维索引，以便高效地搜索 2013 年所有温度在 25 到 30℃ 之间的观测记录。使用一维索引时，你必须要么扫描 2013 年的所有记录（不考虑温度），然后按温度过滤，要么反之。二维索引可以同时按时间戳和温度进行缩小范围 [ 84 ]。

Full-Text Search
全文搜索

Full-text search allows you to search a collection of text documents (web pages, product descriptions, etc.) by keywords that might appear anywhere in the text [85]. Information retrieval is a big, specialist topic that often involves language-specific processing: for example, several Asian languages are written without spaces or punctuation between words, and therefore splitting text into words requires a model that indicates which character sequences constitute a word. Full-text search also often involves matching words that are similar but not identical (such as typos or different grammatical forms of words) and synonyms. Those problems go beyond the scope of this book.
全文搜索允许您通过可能出现在文本中的关键字搜索一组文本文件（网页、产品描述等）[85]。信息检索是一个庞大且专业的主题，通常涉及特定语言的处理：例如，几种亚洲语言在单词之间没有空格或标点符号，因此将文本拆分为单词需要一个模型来指示哪些字符序列构成一个单词。全文搜索通常还涉及匹配相似但不完全相同的单词（例如拼写错误或单词的不同语法形式）和同义词。这些问题超出了本书的范围。

However, at its core, you can think of full-text search as another kind of multidimensional query: in this case, each word that might appear in a text (a term) is a dimension. A document that contains term x has a value of 1 in dimension x, and a document that doesn’t contain x has a value of 0. Searching for documents mentioning “red apples” means a query that looks for a 1 in the red dimension, and simultaneously a 1 in the apples dimension. The number of dimensions may thus be very large.
然而，从本质上讲，您可以将全文搜索视为另一种多维查询：在这种情况下，可能出现在文本中的每个单词（术语）都是一个维度。包含术语 x 的文档在维度 x 中的值为 1，而不包含 x 的文档在维度 x 中的值为 0。搜索提到“红色苹果”的文档意味着一个查询，它在红色维度中寻找 1，同时在苹果维度中寻找 1。因此，维度的数量可能非常大。

The data structure that many search engines use to answer such queries is called an inverted index. This is a key-value structure where the key is a term, and the value is the list of IDs of all the documents that contain the term (the postings list). If the document IDs are sequential numbers, the postings list can also be represented as a sparse bitmap, like in Figure 4-8: the nth bit in the bitmap for term x is a 1 if the document with ID n contains the term x [86].
许多搜索引擎用来回答此类查询的数据结构称为倒排索引。这是一种键值结构，其中键是一个术语，值是包含该术语的所有文档的 ID 列表（发布列表）。如果文档 ID 是连续的数字，则发布列表也可以表示为稀疏位图，如图 4-8 所示：位图中术语 x 的第 n 位为 1，如果 ID 为 n 的文档包含术语 x [86]。

Finding all the documents that contain both terms x and y is now similar to a vectorized data warehouse query that searches for rows matching two conditions (Figure 4-9): load the two bitmaps for terms x and y and compute their bitwise AND. Even if the bitmaps are run-length encoded, this can be done very efficiently.
查找同时包含术语 x 和 y 的所有文档现在类似于一个向量化的数据仓库查询，该查询搜索匹配两个条件的行（图 4-9）：加载术语 x 和 y 的两个位图并计算它们的按位与。即使位图是运行长度编码的，这也可以非常高效地完成。

For example, Lucene, the full-text indexing engine used by Elasticsearch and Solr, works like this [87]. It stores the mapping from term to postings list in SSTable-like sorted files, which are merged in the background using the same log-structured approach we saw earlier in this chapter [88]. PostgreSQL’s GIN index type also uses postings lists to support full-text search and indexing inside JSON documents [89, 90].
例如，Lucene，这是 Elasticsearch 和 Solr 使用的全文索引引擎，工作原理如下[87]。它将术语到文档列表的映射存储在类似 SSTable 的排序文件中，这些文件在后台使用我们在本章前面看到的相同日志结构方法进行合并[88]。PostgreSQL 的 GIN 索引类型也使用文档列表来支持全文搜索和 JSON 文档内部的索引[89, 90]。

Instead of breaking text into words, an alternative is to find all the substrings of length n, which are called n-grams. For example, the trigrams (n = 3) of the string "hello" are "hel", "ell", and "llo". If we build an inverted index of all trigrams, we can search the documents for arbitrary substrings that are at least three characters long. Trigram indexes even allows regular expressions in search queries; the downside is that they are quite large [91].
除了将文本拆分为单词外，另一种方法是查找所有长度为 n 的子字符串，这些子字符串称为 n-grams。例如，字符串 "hello" 的三元组（n = 3）是 "hel" 、 "ell" 和 "llo" 。如果我们构建所有三元组的倒排索引，我们可以搜索文档中任意长度至少为三个字符的子字符串。三元组索引甚至允许在搜索查询中使用正则表达式；缺点是它们的体积相当大[91]。

To cope with typos in documents or queries, Lucene is able to search text for words within a certain edit distance (an edit distance of 1 means that one letter has been added, removed, or replaced) [92]. It does this by storing the set of terms as a finite state automaton over the characters in the keys, similar to a trie [93], and transforming it into a Levenshtein automaton, which supports efficient search for words within a given edit distance [94].
为了应对文档或查询中的拼写错误，Lucene 能够在一定的编辑距离内搜索文本中的单词（编辑距离为 1 意味着添加、删除或替换了一个字母）[92]。它通过将术语集存储为字符上的有限状态自动机，类似于前缀树[93]，并将其转换为 Levenshtein 自动机，从而支持在给定编辑距离内高效搜索单词[94]。

Vector Embeddings
向量嵌入

Semantic search goes beyond synonyms and typos to try and understand document concepts and user intentions. For example, if your help pages contain a page titled “cancelling your subscription”, users should still be able to find that page when searching for “how to close my account” or “terminate contract”, which are close in terms of meaning even though they use completely different words.
语义搜索超越了同义词和拼写错误，试图理解文档概念和用户意图。例如，如果您的帮助页面包含一个标题为“取消订阅”的页面，当用户搜索“如何关闭我的账户”或“终止合同”时，仍然应该能够找到该页面，因为这些词在意义上是相近的，尽管它们使用了完全不同的词。

To understand a document’s semantics—​its meaning—​semantic search indexes use embedding models to translate a document into a vector of floating-point values, called a vector embedding. The vector represents a point in a multi-dimensional space, and each floating-point value represents the document’s location along one dimension’s axis. Embedding models generate vector embeddings that are near each other (in this multi-dimensional space) when the embedding’s input documents are semantically similar.
为了理解文档的语义——即其含义——语义搜索索引使用嵌入模型将文档转换为一个浮点值的向量，称为向量嵌入。该向量表示多维空间中的一个点，每个浮点值表示文档在某一维度轴上的位置。当嵌入的输入文档在语义上相似时，嵌入模型生成的向量嵌入在这个多维空间中彼此接近。

Note
注意

We saw the term vectorized processing in “Query Execution: Compilation and Vectorization”. Vectors in semantic search have a different meaning. In vectorized processing, the vector refers to a batch of bits that can be processed with specially optimized code. In embedding models, vectors are a list of floating point numbers that represent a location in multi-dimensional space.
我们在“查询执行：编译和向量化”中看到了向量化处理这个术语。在语义搜索中，向量有不同的含义。在向量化处理过程中，向量指的是可以使用特别优化的代码处理的一批位。在嵌入模型中，向量是一组浮点数，表示多维空间中的一个位置。

For example, a three-dimensional vector embedding for a Wikipedia page about agriculture might be [0.1, 0.22, 0.11]. A Wikipedia page about vegetables would be quite near, perhaps with an embedding of [0.13, 0.19, 0.24]. A page about star schemas might have an embedding of [0.82, 0.39, -0.74], comparatively far away. We can tell by looking that the first two vectors are closer than the third.
例如，关于农业的维基百科页面的三维向量嵌入可能是 [0.1, 0.22, 0.11]。关于蔬菜的维基百科页面会非常接近，也许嵌入为 [0.13, 0.19, 0.24]。关于星型模式的页面可能有一个嵌入 [0.82, 0.39, -0.74]，相对较远。我们可以通过观察得出前两个向量比第三个更接近。

Embedding models use much larger vectors (often over 1,000 numbers), but the principles are the same. We don’t try to understand what the individual numbers mean; they’re simply a way for embedding models to point to a location in an abstract multi-dimensional space. Search engines use distance functions such as cosine similarity or Euclidean distance to measure the distance between vectors. Cosine similarity measures the cosine of the angle of two vectors to determine how close they are, while Euclidean distance measures the straight-line distance between two points in space.
嵌入模型使用更大的向量（通常超过 1,000 个数字），但原理是相同的。我们并不试图理解每个数字的含义；它们只是嵌入模型指向抽象多维空间中某个位置的一种方式。搜索引擎使用距离函数，如余弦相似度或欧几里得距离，来测量向量之间的距离。余弦相似度通过测量两个向量的夹角余弦来确定它们的接近程度，而欧几里得距离则测量空间中两点之间的直线距离。

Many early embedding models such as Word2Vec [95], BERT [96], and GPT [97] worked with text data. Such models are usually implemented as neural networks. Researchers went on to create embedding models for video, audio, and images as well. More recently, model architecture has become multimodal: a single model can generate vector embeddings for multiple modalities such as text and images.
许多早期的嵌入模型，如 Word2Vec [ 95]、BERT [ 96]和 GPT [ 97]，主要处理文本数据。这些模型通常以神经网络的形式实现。研究人员还创建了用于视频、音频和图像的嵌入模型。最近，模型架构变得多模态：单个模型可以为多种模态（如文本和图像）生成向量嵌入。

Semantic search engines use an embedding model to generate a vector embedding when a user enters a query. The user’s query and related context (such as a user’s location) are fed into the embedding model. After the embedding model generates the query’s vector embedding, the search engine must find documents with similar vector embeddings using a vector index.
语义搜索引擎使用嵌入模型在用户输入查询时生成向量嵌入。用户的查询和相关上下文（如用户的位置）被输入到嵌入模型中。在嵌入模型生成查询的向量嵌入后，搜索引擎必须使用向量索引找到具有相似向量嵌入的文档。

Vector indexes store the vector embeddings of a collection of documents. To query the index, you pass in the vector embedding of the query, and the index returns the documents whose vectors are closest to the query vector. Since the R-trees we saw previously don’t work well for vectors with many dimensions, specialized vector indexes are used, such as:
向量索引存储一组文档的向量嵌入。要查询索引，您需要传入查询的向量嵌入，索引将返回与查询向量最接近的文档。由于我们之前看到的 R 树不适合处理高维向量，因此使用了专门的向量索引，例如：

Flat indexes
平面索引
Vectors are stored in the index as they are. A query must read every vector and measure its distance to the query vector. Flat indexes are accurate, but measuring the distance between the query and each vector is slow.
向量以原样存储在索引中。查询必须读取每个向量并测量其与查询向量的距离。平面索引是准确的，但测量查询与每个向量之间的距离很慢。

Inverted file (IVF) indexes
倒排文件（IVF）索引
The vector space is clustered into partitions (called centroids) of vectors to reduce the number of vectors that must be compared. IVF indexes are faster than flat indexes, but can give only approximate results: the query and a document may fall into different partitions, even though they are close to each other. A query on an IVF index first defines probes, which are simply the number of partitions to check. Queries that use more probes will be more accurate, but will be slower, as more vectors must be compared.
向量空间被聚类成多个分区（称为质心），以减少必须比较的向量数量。IVF 索引比平面索引更快，但只能提供近似结果：查询和文档可能落在不同的分区中，即使它们彼此接近。IVF 索引上的查询首先定义探针，探针只是要检查的分区数量。使用更多探针的查询将更准确，但会更慢，因为必须比较更多的向量。

Hierarchical Navigable Small World (HNSW)
分层可导航小世界（HNSW）
HNSW indexes maintain multiple layers of the vector space, as illustrated in Figure 4-11. Each layer is represented as a graph, where nodes represent vectors, and edges represent proximity to nearby vectors. A query starts by locating the nearest vector in the topmost layer, which has a small number of nodes. The query then moves to the same node in the layer below and follows the edges in that layer, which is more densely connected, looking for a vector that is closer to the query vector. The process continues until the last layer is reached. As with IVF indexes, HNSW indexes are approximate.
HNSW 索引维护多个层次的向量空间，如图 4-11 所示。每一层被表示为一个图，其中节点代表向量，边代表与附近向量的接近程度。查询从定位最上层中最近的向量开始，该层的节点数量较少。然后，查询移动到下层的相同节点，并沿着该层中更密集连接的边查找与查询向量更接近的向量。这个过程持续进行，直到到达最后一层。与 IVF 索引一样，HNSW 索引也是近似的。

ddia 0411
Figure 4-11. Searching for the database entry that is closest to a given query vector in a HNSW index.
图 4-11. 在 HNSW 索引中搜索与给定查询向量最接近的数据库条目。

Many popular vector databases implement IVF and HNSW indexes. Facebook’s Faiss library has many variations of each [98], and PostgreSQL’s pgvector supports both as well [99]. The full details of the IVF and HNSW algorithms are beyond the scope of this book, but their papers are an excellent resource [100, 101].
许多流行的向量数据库实现了 IVF 和 HNSW 索引。Facebook 的 Faiss 库有许多每种索引的变体[98]，而 PostgreSQL 的 pgvector 也支持这两种索引[99]。IVF 和 HNSW 算法的完整细节超出了本书的范围，但它们的论文是一个很好的资源[100, 101]。

Summary
总结

In this chapter we tried to get to the bottom of how databases perform storage and retrieval. What happens when you store data in a database, and what does the database do when you query for the data again later?
在本章中，我们试图深入了解数据库如何进行存储和检索。当你将数据存储在数据库中时会发生什么，以及当你稍后查询这些数据时数据库会做什么？

“Analytical versus Operational Systems” introduced the distinction between transaction processing (OLTP) and analytics (OLAP). In this chapter we saw that storage engines optimized for OLTP look very different from those optimized for analytics:
“分析系统与操作系统”介绍了事务处理（OLTP）和分析（OLAP）之间的区别。在本章中，我们看到针对 OLTP 优化的存储引擎与针对分析优化的存储引擎有很大的不同：

OLTP systems are optimized for a high volume of requests, each of which reads and writes a small number of records, and which need fast responses. The records are typically accessed via a primary key or a secondary index, and these indexes are typically ordered mappings from key to record, which also support range queries.
OLTP 系统针对高请求量进行了优化，每个请求读取和写入少量记录，并且需要快速响应。记录通常通过主键或辅助索引访问，这些索引通常是从键到记录的有序映射，同时也支持范围查询。

Data warehouses and similar analytic systems are optimized for complex read queries that scan over a large number of records. They generally use a column-oriented storage layout with compression that minimizes the amount of data that such a query needs to read off disk, and just-in-time compilation of queries or vectorization to minimize the amount of CPU time spent processing the data.
数据仓库和类似的分析系统针对复杂的读取查询进行了优化，这些查询会扫描大量记录。它们通常使用列式存储布局，并进行压缩，以最小化此类查询从磁盘读取的数据量，并通过即时编译查询或向量化来最小化处理数据所花费的 CPU 时间。

On the OLTP side, we saw storage engines from two main schools of thought:
在 OLTP 方面，我们看到了两种主要思想流派的存储引擎：

The log-structured approach, which only permits appending to files and deleting obsolete files, but never updates a file that has been written. SSTables, LSM-trees, RocksDB, Cassandra, HBase, Scylla, Lucene, and others belong to this group. In general, log-structured storage engines tend to provide high write throughput.
日志结构化方法，仅允许向文件追加内容和删除过时文件，但从不更新已写入的文件。SSTables、LSM 树、RocksDB、Cassandra、HBase、Scylla、Lucene 等都属于这一组。一般来说，日志结构化存储引擎倾向于提供高写入吞吐量。

The update-in-place approach, which treats the disk as a set of fixed-size pages that can be overwritten. B-trees, the biggest example of this philosophy, are used in all major relational OLTP databases and also many nonrelational ones. As a rule of thumb, B-trees tend to be better for reads, providing higher read throughput and lower response times than log-structured storage.
就地更新方法，将磁盘视为一组可以被覆盖的固定大小页面。B 树是这一理念的最大例子，广泛应用于所有主要的关系型 OLTP 数据库以及许多非关系型数据库。作为经验法则，B 树在读取方面通常表现更好，提供比日志结构化存储更高的读取吞吐量和更低的响应时间。

We then looked at indexes that can search for multiple conditions at the same time: multidimensional indexes such as R-trees that can search for points on a map by latitude and longitude at the same time, and full-text search indexes that can search for multiple keywords appearing in the same text. Finally, vector databases are used for semantic search on text documents and other media; they use vectors with a larger number of dimensions and find similar documents by comparing vector similarity.
我们接着看了一下可以同时搜索多个条件的索引：多维索引，例如 R 树，可以同时通过经纬度在地图上搜索点，以及全文搜索索引，可以搜索出现在同一文本中的多个关键字。最后，向量数据库用于对文本文件和其他媒体进行语义搜索；它们使用维度更大的向量，通过比较向量相似性来找到相似的文档。

As an application developer, if you’re armed with this knowledge about the internals of storage engines, you are in a much better position to know which tool is best suited for your particular application. If you need to adjust a database’s tuning parameters, this understanding allows you to imagine what effect a higher or a lower value may have.
作为应用程序开发者，如果你掌握了关于存储引擎内部结构的这些知识，你将更好地了解哪个工具最适合你的特定应用。如果你需要调整数据库的调优参数，这种理解使你能够想象更高或更低的值可能产生的影响。

Although this chapter couldn’t make you an expert in tuning any one particular storage engine, it has hopefully equipped you with enough vocabulary and ideas that you can make sense of the documentation for the database of your choice.
尽管本章无法让你成为某个特定存储引擎调优的专家，但希望它能为你提供足够的词汇和思路，使你能够理解所选数据库的文档。

Footnotes
脚注

References
参考文献

[1] Nikolay Samokhvalov. How partial, covering, and multicolumn indexes may slow down UPDATEs in PostgreSQL. postgres.ai, October 2021. Archived at perma.cc/PBK3-F4G9
[ 1] Nikolay Samokhvalov. 部分索引、覆盖索引和多列索引如何减慢 PostgreSQL 中的 UPDATE 操作。postgres.ai，2021 年 10 月。存档于 perma.cc/PBK3-F4G9

[2] Goetz Graefe. Modern B-Tree Techniques. Foundations and Trends in Databases, volume 3, issue 4, pages 203–402, August 2011. doi:10.1561/1900000028
[ 2] Goetz Graefe. 现代 B-树技术. 数据库基础与趋势，第 3 卷，第 4 期，203–402 页，2011 年 8 月。doi:10.1561/1900000028

[3] Evan Jones. Why databases use ordered indexes but programming uses hash tables. evanjones.ca, December 2019. Archived at perma.cc/NJX8-3ZZD
[ 3] Evan Jones. 为什么数据库使用有序索引而编程使用哈希表。evanjones.ca，2019 年 12 月。存档于 perma.cc/NJX8-3ZZD

[4] Branimir Lambov. CEP-25: Trie-indexed SSTable format. cwiki.apache.org, November 2022. Archived at perma.cc/HD7W-PW8U. Linked Google Doc archived at perma.cc/UL6C-AAAE
[ 4] Branimir Lambov. CEP-25: Trie 索引的 SSTable 格式. cwiki.apache.org，2022 年 11 月。存档于 perma.cc/HD7W-PW8U。链接的 Google 文档存档于 perma.cc/UL6C-AAAE

[5] Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein: Introduction to Algorithms, 3rd edition. MIT Press, 2009. ISBN: 978-0-262-53305-8
[ 5] Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, 和 Clifford Stein: 算法导论, 第 3 版. MIT 出版社, 2009 年. ISBN: 978-0-262-53305-8

[6] Branimir Lambov. Trie Memtables in Cassandra. Proceedings of the VLDB Endowment, volume 15, issue 12, pages 3359–3371, August 2022. doi:10.14778/3554821.3554828
[ 6] Branimir Lambov. Cassandra 中的 Trie Memtables. VLDB 基金会会议录, 第 15 卷, 第 12 期, 第 3359–3371 页, 2022 年 8 月. doi:10.14778/3554821.3554828

[7] Dhruba Borthakur. The History of RocksDB. rocksdb.blogspot.com, November 2013. Archived at perma.cc/Z7C5-JPSP
[ 7] Dhruba Borthakur. RocksDB 的历史. rocksdb.blogspot.com, 2013 年 11 月. 存档于 perma.cc/Z7C5-JPSP

[8] Matteo Bertozzi. Apache HBase I/O – HFile. blog.cloudera.com, June 2012. Archived at perma.cc/U9XH-L2KL
[ 8] Matteo Bertozzi. Apache HBase I/O – HFile. blog.cloudera.com, 2012 年 6 月. 存档于 perma.cc/U9XH-L2KL

[9] Fay Chang, Jeffrey Dean, Sanjay Ghemawat, Wilson C. Hsieh, Deborah A. Wallach, Mike Burrows, Tushar Chandra, Andrew Fikes, and Robert E. Gruber. Bigtable: A Distributed Storage System for Structured Data. At 7th USENIX Symposium on Operating System Design and Implementation (OSDI), November 2006.
[ 9] Fay Chang, Jeffrey Dean, Sanjay Ghemawat, Wilson C. Hsieh, Deborah A. Wallach, Mike Burrows, Tushar Chandra, Andrew Fikes, 和 Robert E. Gruber. Bigtable: 一种用于结构化数据的分布式存储系统. 在第七届 USENIX 操作系统设计与实现研讨会 (OSDI) 上, 2006 年 11 月.

[10] Patrick O’Neil, Edward Cheng, Dieter Gawlick, and Elizabeth O’Neil. The Log-Structured Merge-Tree (LSM-Tree). Acta Informatica, volume 33, issue 4, pages 351–385, June 1996. doi:10.1007/s002360050048
[ 10] Patrick O’Neil, Edward Cheng, Dieter Gawlick, 和 Elizabeth O’Neil. 日志结构合并树 (LSM-Tree). Acta Informatica, 第 33 卷, 第 4 期, 页码 351–385, 1996 年 6 月. doi:10.1007/s002360050048

[11] Mendel Rosenblum and John K. Ousterhout. The Design and Implementation of a Log-Structured File System. ACM Transactions on Computer Systems, volume 10, issue 1, pages 26–52, February 1992. doi:10.1145/146941.146943
[ 11] Mendel Rosenblum 和 John K. Ousterhout. 日志结构文件系统的设计与实现. ACM 计算机系统交易, 第 10 卷, 第 1 期, 页码 26–52, 1992 年 2 月. doi:10.1145/146941.146943

[12] Michael Armbrust, Tathagata Das, Liwen Sun, Burak Yavuz, Shixiong Zhu, Mukul Murthy, Joseph Torres, Herman van Hovell, Adrian Ionescu, Alicja Łuszczak, Michał Świtakowski, Michał Szafrański, Xiao Li, Takuya Ueshin, Mostafa Mokhtar, Peter Boncz, Ali Ghodsi, Sameer Paranjpye, Pieter Senster, Reynold Xin, and Matei Zaharia. Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores. Proceedings of the VLDB Endowment, volume 13, issue 12, pages 3411–3424, August 2020. doi:10.14778/3415478.3415560
[ 12] Michael Armbrust, Tathagata Das, Liwen Sun, Burak Yavuz, Shixiong Zhu, Mukul Murthy, Joseph Torres, Herman van Hovell, Adrian Ionescu, Alicja Łuszczak, Michał Świtakowski, Michał Szafrański, Xiao Li, Takuya Ueshin, Mostafa Mokhtar, Peter Boncz, Ali Ghodsi, Sameer Paranjpye, Pieter Senster, Reynold Xin, 和 Matei Zaharia. Delta Lake: 高性能的 ACID 表存储在云对象存储上. VLDB 基金会会议录, 第 13 卷, 第 12 期, 第 3411–3424 页, 2020 年 8 月. doi:10.14778/3415478.3415560

[13] Burton H. Bloom. Space/Time Trade-offs in Hash Coding with Allowable Errors. Communications of the ACM, volume 13, issue 7, pages 422–426, July 1970. doi:10.1145/362686.362692
[ 13] Burton H. Bloom. 允许错误的哈希编码中的空间/时间权衡. ACM 通讯, 第 13 卷, 第 7 期, 第 422–426 页, 1970 年 7 月. doi:10.1145/362686.362692

[14] Adam Kirsch and Michael Mitzenmacher. Less Hashing, Same Performance: Building a Better Bloom Filter. Random Structures & Algorithms, volume 33, issue 2, pages 187–218, September 2008. doi:10.1002/rsa.20208
[ 14] Adam Kirsch 和 Michael Mitzenmacher. 更少的哈希, 相同的性能: 构建更好的布隆过滤器. 随机结构与算法, 第 33 卷, 第 2 期, 第 187–218 页, 2008 年 9 月. doi:10.1002/rsa.20208

[15] Thomas Hurst. Bloom Filter Calculator. hur.st, September 2023. Archived at perma.cc/L3AV-6VC2
[ 15] Thomas Hurst. 布隆过滤器计算器. hur.st, 2023 年 9 月. 存档于 perma.cc/L3AV-6VC2

[16] Chen Luo and Michael J. Carey. LSM-based storage techniques: a survey. The VLDB Journal, volume 29, pages 393–418, July 2019. doi:10.1007/s00778-019-00555-y
[ 16] 陈洛和迈克尔·J·凯瑞。基于 LSM 的存储技术：一项调查。《VLDB 期刊》，第 29 卷，393–418 页，2019 年 7 月。doi:10.1007/s00778-019-00555-y

[17] Mark Callaghan. Name that compaction algorithm. smalldatum.blogspot.com, August 2018. Archived at perma.cc/CN4M-82DY
[ 17] 马克·卡拉汉。命名那个压缩算法。smalldatum.blogspot.com，2018 年 8 月。存档于 perma.cc/CN4M-82DY

[18] Prashanth Rao. Embedded databases (1): The harmony of DuckDB, KùzuDB and LanceDB. thedataquarry.com, August 2023. Archived at perma.cc/PA28-2R35
[ 18] 普拉尚特·拉奥。嵌入式数据库（1）：DuckDB、KùzuDB 和 LanceDB 的和谐。thedataquarry.com，2023 年 8 月。存档于 perma.cc/PA28-2R35

[19] Hacker News discussion. Bluesky migrates to single-tenant SQLite. news.ycombinator.com, October 2023. Archived at perma.cc/69LM-5P6X
[ 19] Hacker News 讨论。Bluesky 迁移到单租户 SQLite。news.ycombinator.com，2023 年 10 月。存档于 perma.cc/69LM-5P6X

[20] Rudolf Bayer and Edward M. McCreight. Organization and Maintenance of Large Ordered Indices. Boeing Scientific Research Laboratories, Mathematical and Information Sciences Laboratory, report no. 20, July 1970. doi:10.1145/1734663.1734671
[ 20] Rudolf Bayer 和 Edward M. McCreight. 大型有序索引的组织与维护. 波音科学研究实验室，数学与信息科学实验室，报告编号 20，1970 年 7 月。doi:10.1145/1734663.1734671

[21] Douglas Comer. The Ubiquitous B-Tree. ACM Computing Surveys, volume 11, issue 2, pages 121–137, June 1979. doi:10.1145/356770.356776
[ 21] Douglas Comer. 无处不在的 B 树. ACM 计算机调查, 第 11 卷, 第 2 期, 第 121–137 页, 1979 年 6 月. doi:10.1145/356770.356776

[22] C. Mohan and Frank Levine. ARIES/IM: An Efficient and High Concurrency Index Management Method Using Write-Ahead Logging. At ACM International Conference on Management of Data (SIGMOD), June 1992. doi:10.1145/130283.130338
[ 22] C. Mohan 和 Frank Levine. ARIES/IM：一种高效且高并发的索引管理方法，使用预写日志。发表于 ACM 数据管理国际会议 (SIGMOD)，1992 年 6 月。doi:10.1145/130283.130338

[23] Hironobu Suzuki. The Internals of PostgreSQL. interdb.jp, 2017.
[ 23] Hironobu Suzuki. PostgreSQL 的内部结构。interdb.jp，2017 年。

[24] Howard Chu. LDAP at Lightning Speed. At Build Stuff ’14, November 2014. Archived at perma.cc/GB6Z-P8YH
[ 24] Howard Chu. LDAP 以闪电般的速度。发表于 Build Stuff ’14，2014 年 11 月。存档于 perma.cc/GB6Z-P8YH

[25] Manos Athanassoulis, Michael S. Kester, Lukas M. Maas, Radu Stoica, Stratos Idreos, Anastasia Ailamaki, and Mark Callaghan. Designing Access Methods: The RUM Conjecture. At 19th International Conference on Extending Database Technology (EDBT), March 2016. doi:10.5441/002/edbt.2016.42
[ 25] Manos Athanassoulis, Michael S. Kester, Lukas M. Maas, Radu Stoica, Stratos Idreos, Anastasia Ailamaki, 和 Mark Callaghan. 设计访问方法：RUM 猜想。发表于第 19 届国际数据库技术扩展会议（EDBT），2016 年 3 月。doi:10.5441/002/edbt.2016.42

[26] Ben Stopford. Log Structured Merge Trees. benstopford.com, February 2015. Archived at perma.cc/E5BV-KUJ6
[ 26] Ben Stopford. 日志结构合并树。benstopford.com，2015 年 2 月。存档于 perma.cc/E5BV-KUJ6

[27] Mark Callaghan. The Advantages of an LSM vs a B-Tree. smalldatum.blogspot.co.uk, January 2016. Archived at perma.cc/3TYZ-EFUD
[ 27] Mark Callaghan. LSM 与 B 树的优势。smalldatum.blogspot.co.uk，2016 年 1 月。存档于 perma.cc/3TYZ-EFUD

[28] Oana Balmau, Florin Dinu, Willy Zwaenepoel, Karan Gupta, Ravishankar Chandhiramoorthi, and Diego Didona. SILK: Preventing Latency Spikes in Log-Structured Merge Key-Value Stores. At USENIX Annual Technical Conference, July 2019.
[ 28] Oana Balmau, Florin Dinu, Willy Zwaenepoel, Karan Gupta, Ravishankar Chandhiramoorthi, 和 Diego Didona. SILK: 防止日志结构合并键值存储中的延迟峰值. 在 USENIX 年度技术会议上, 2019 年 7 月.

[29] Igor Canadi, Siying Dong, Mark Callaghan, et al. RocksDB Tuning Guide. github.com, 2023. Archived at perma.cc/UNY4-MK6C
[ 29] Igor Canadi, Siying Dong, Mark Callaghan, 等. RocksDB 调优指南. github.com, 2023 年. 存档于 perma.cc/UNY4-MK6C

[30] Gabriel Haas and Viktor Leis. What Modern NVMe Storage Can Do, and How to Exploit it: High-Performance I/O for High-Performance Storage Engines. Proceedings of the VLDB Endowment, volume 16, issue 9, pages 2090-2102. doi:10.14778/3598581.3598584
[ 30] Gabriel Haas 和 Viktor Leis. 现代 NVMe 存储能做什么，以及如何利用它: 高性能存储引擎的高性能 I/O. VLDB 基金会会议录, 第 16 卷, 第 9 期, 页码 2090-2102. doi:10.14778/3598581.3598584

[31] Emmanuel Goossaert. Coding for SSDs. codecapsule.com, February 2014.
[ 31] Emmanuel Goossaert. SSD 编码. codecapsule.com, 2014 年 2 月.

[32] Jack Vanlightly. Is sequential IO dead in the era of the NVMe drive? jack-vanlightly.com, May 2023. Archived at perma.cc/7TMZ-TAPU
[ 32] Jack Vanlightly. 在 NVMe 驱动器时代，顺序 IO 是否已经死去？jack-vanlightly.com，2023 年 5 月。存档于 perma.cc/7TMZ-TAPU

[33] Alibaba Cloud Storage Team. Storage System Design Analysis: Factors Affecting NVMe SSD Performance (2). alibabacloud.com, January 2019. Archived at archive.org
[ 33] 阿里巴巴云存储团队。存储系统设计分析：影响 NVMe SSD 性能的因素（2）。alibabacloud.com，2019 年 1 月。存档于 archive.org

[34] Xiao-Yu Hu and Robert Haas. The Fundamental Limit of Flash Random Write Performance: Understanding, Analysis and Performance Modelling. dominoweb.draco.res.ibm.com, March 2010. Archived at perma.cc/8JUL-4ZDS
[ 34] 胡晓宇和罗伯特·哈斯。闪存随机写入性能的基本限制：理解、分析与性能建模。dominoweb.draco.res.ibm.com，2010 年 3 月。存档于 perma.cc/8JUL-4ZDS

[35] Lanyue Lu, Thanumalayan Sankaranarayana Pillai, Andrea C. Arpaci-Dusseau, and Remzi H. Arpaci-Dusseau. WiscKey: Separating Keys from Values in SSD-conscious Storage. At 4th USENIX Conference on File and Storage Technologies (FAST), February 2016.
[ 35] 兰月·卢、塔努马拉扬·桑卡拉纳亚纳·皮莱、安德烈亚·C·阿尔帕奇-杜塞和雷姆齐·H·阿尔帕奇-杜塞。WiscKey：在 SSD 意识存储中将键与值分离。在第四届 USENIX 文件与存储技术会议（FAST）上，2016 年 2 月。

[36] Peter Zaitsev. Innodb Double Write. percona.com, August 2006. Archived at perma.cc/NT4S-DK7T
[ 36] Peter Zaitsev. Innodb 双重写入. percona.com, 2006 年 8 月. 存档于 perma.cc/NT4S-DK7T

[37] Tomas Vondra. On the Impact of Full-Page Writes. 2ndquadrant.com, November 2016. Archived at perma.cc/7N6B-CVL3
[ 37] Tomas Vondra. 全页写入的影响. 2ndquadrant.com, 2016 年 11 月. 存档于 perma.cc/7N6B-CVL3

[38] Mark Callaghan. Read, write & space amplification - B-Tree vs LSM. smalldatum.blogspot.com, November 2015. Archived at perma.cc/S487-WK5P
[ 38] Mark Callaghan. 读取、写入与空间放大 - B-树与 LSM. smalldatum.blogspot.com, 2015 年 11 月. 存档于 perma.cc/S487-WK5P

[39] Mark Callaghan. Choosing Between Efficiency and Performance with RocksDB. At Code Mesh, November 2016. Video at youtube.com/watch?v=tgzkgZVXKB4
[ 39] Mark Callaghan. 在 RocksDB 中选择效率与性能. 在 Code Mesh, 2016 年 11 月. 视频在 youtube.com/watch?v=tgzkgZVXKB4

[40] Subhadeep Sarkar, Tarikul Islam Papon, Dimitris Staratzis, Zichen Zhu, and Manos Athanassoulis. Enabling Timely and Persistent Deletion in LSM-Engines. ACM Transactions on Database Systems, volume 48, issue 3, article no. 8, August 2023. doi:10.1145/3599724
[ 40] Subhadeep Sarkar, Tarikul Islam Papon, Dimitris Staratzis, Zichen Zhu, 和 Manos Athanassoulis. 在 LSM 引擎中实现及时和持久的删除. ACM 数据库系统交易, 第 48 卷, 第 3 期, 文章编号 8, 2023 年 8 月. doi:10.1145/3599724

[41] Drew Silcock. How Postgres stores data on disk – this one’s a page turner. drew.silcock.dev, August 2024. Archived at perma.cc/8K7K-7VJ2
[ 41] Drew Silcock. Postgres 如何在磁盘上存储数据 – 这真是一本引人入胜的书. drew.silcock.dev, 2024 年 8 月. 存档于 perma.cc/8K7K-7VJ2

[42] Joe Webb. Using Covering Indexes to Improve Query Performance. simple-talk.com, September 2008. Archived at perma.cc/6MEZ-R5VR
[ 42] Joe Webb. 使用覆盖索引来提高查询性能. simple-talk.com, 2008 年 9 月. 存档于 perma.cc/6MEZ-R5VR

[43] Michael Stonebraker, Samuel Madden, Daniel J. Abadi, Stavros Harizopoulos, Nabil Hachem, and Pat Helland. The End of an Architectural Era (It’s Time for a Complete Rewrite). At 33rd International Conference on Very Large Data Bases (VLDB), September 2007.
[ 43] Michael Stonebraker, Samuel Madden, Daniel J. Abadi, Stavros Harizopoulos, Nabil Hachem, 和 Pat Helland. 一个架构时代的结束（是时候进行彻底重写了）. 在第 33 届国际大型数据库会议 (VLDB) 上, 2007 年 9 月.

[44] VoltDB Technical Overview White Paper. VoltDB, 2017. Archived at perma.cc/B9SF-SK5G
[ 44] VoltDB 技术概述白皮书。VoltDB，2017。存档于 perma.cc/B9SF-SK5G

[45] Stephen M. Rumble, Ankita Kejriwal, and John K. Ousterhout. Log-Structured Memory for DRAM-Based Storage. At 12th USENIX Conference on File and Storage Technologies (FAST), February 2014.
[ 45] Stephen M. Rumble, Ankita Kejriwal 和 John K. Ousterhout。基于 DRAM 存储的日志结构内存。在第 12 届 USENIX 文件与存储技术会议（FAST），2014 年 2 月。

[46] Stavros Harizopoulos, Daniel J. Abadi, Samuel Madden, and Michael Stonebraker. OLTP Through the Looking Glass, and What We Found There. At ACM International Conference on Management of Data (SIGMOD), June 2008. doi:10.1145/1376616.1376713
[ 46] Stavros Harizopoulos, Daniel J. Abadi, Samuel Madden 和 Michael Stonebraker。透过镜子看 OLTP，以及我们在那里发现的内容。在 ACM 国际数据管理会议（SIGMOD），2008 年 6 月。doi:10.1145/1376616.1376713

[47] Per-Åke Larson, Cipri Clinciu, Campbell Fraser, Eric N. Hanson, Mostafa Mokhtar, Michal Nowakiewicz, Vassilis Papadimos, Susan L. Price, Srikumar Rangarajan, Remus Rusanu, and Mayukh Saubhasik. Enhancements to SQL Server Column Stores. At ACM International Conference on Management of Data (SIGMOD), June 2013. doi:10.1145/2463676.2463708
[ 47] Per-Åke Larson, Cipri Clinciu, Campbell Fraser, Eric N. Hanson, Mostafa Mokhtar, Michal Nowakiewicz, Vassilis Papadimos, Susan L. Price, Srikumar Rangarajan, Remus Rusanu 和 Mayukh Saubhasik。对 SQL Server 列存储的增强。在 ACM 国际数据管理会议（SIGMOD），2013 年 6 月。doi:10.1145/2463676.2463708

[48] Franz Färber, Norman May, Wolfgang Lehner, Philipp Große, Ingo Müller, Hannes Rauhe, and Jonathan Dees. The SAP HANA Database – An Architecture Overview. IEEE Data Engineering Bulletin, volume 35, issue 1, pages 28–33, March 2012.
[ 48] Franz Färber, Norman May, Wolfgang Lehner, Philipp Große, Ingo Müller, Hannes Rauhe, 和 Jonathan Dees. SAP HANA 数据库 – 架构概述. IEEE 数据工程公报, 第 35 卷, 第 1 期, 第 28–33 页, 2012 年 3 月.

[49] Michael Stonebraker. The Traditional RDBMS Wisdom Is (Almost Certainly) All Wrong. Presentation at EPFL, May 2013.
[ 49] Michael Stonebraker. 传统 RDBMS 的智慧几乎肯定是错误的. 在 EPFL 的演讲, 2013 年 5 月.

[50] Adam Prout, Szu-Po Wang, Joseph Victor, Zhou Sun, Yongzhu Li, Jack Chen, Evan Bergeron, Eric Hanson, Robert Walzer, Rodrigo Gomes, and Nikita Shamgunov. Cloud-Native Transactions and Analytics in SingleStore. At ACM International Conference on Management of Data (SIGMOD), June 2022. doi:10.1145/3514221.3526055
[ 50] Adam Prout, Szu-Po Wang, Joseph Victor, Zhou Sun, Yongzhu Li, Jack Chen, Evan Bergeron, Eric Hanson, Robert Walzer, Rodrigo Gomes, 和 Nikita Shamgunov. 单一存储中的云原生事务和分析. 在 ACM 国际数据管理会议 (SIGMOD), 2022 年 6 月. doi:10.1145/3514221.3526055

[51] Tino Tereshko and Jordan Tigani. BigQuery under the hood. cloud.google.com, January 2016. Archived at perma.cc/WP2Y-FUCF
[ 51] Tino Tereshko 和 Jordan Tigani. BigQuery 的内部机制. cloud.google.com, 2016 年 1 月. 存档于 perma.cc/WP2Y-FUCF

[52] Wes McKinney. The Road to Composable Data Systems: Thoughts on the Last 15 Years and the Future. wesmckinney.com, September 2023. Archived at perma.cc/6L2M-GTJX
[ 52] Wes McKinney. 可组合数据系统之路：对过去 15 年及未来的思考。wesmckinney.com，2023 年 9 月。存档于 perma.cc/6L2M-GTJX

[53] Michael Stonebraker, Daniel J. Abadi, Adam Batkin, Xuedong Chen, Mitch Cherniack, Miguel Ferreira, Edmond Lau, Amerson Lin, Sam Madden, Elizabeth O’Neil, Pat O’Neil, Alex Rasin, Nga Tran, and Stan Zdonik. C-Store: A Column-oriented DBMS. At 31st International Conference on Very Large Data Bases (VLDB), pages 553–564, September 2005.
[ 53] Michael Stonebraker, Daniel J. Abadi, Adam Batkin, Xuedong Chen, Mitch Cherniack, Miguel Ferreira, Edmond Lau, Amerson Lin, Sam Madden, Elizabeth O’Neil, Pat O’Neil, Alex Rasin, Nga Tran, 和 Stan Zdonik. C-Store：一种列式数据库管理系统。在第 31 届国际大型数据库会议（VLDB）上，页面 553–564，2005 年 9 月。

[54] Julien Le Dem. Dremel Made Simple with Parquet. blog.twitter.com, September 2013.
[ 54] Julien Le Dem. 用 Parquet 简化 Dremel. blog.twitter.com, 2013 年 9 月.

[55] Sergey Melnik, Andrey Gubarev, Jing Jing Long, Geoffrey Romer, Shiva Shivakumar, Matt Tolton, and Theo Vassilakis. Dremel: Interactive Analysis of Web-Scale Datasets. At 36th International Conference on Very Large Data Bases (VLDB), pages 330–339, September 2010. doi:10.14778/1920841.1920886
[ 55] Sergey Melnik, Andrey Gubarev, Jing Jing Long, Geoffrey Romer, Shiva Shivakumar, Matt Tolton, 和 Theo Vassilakis. Dremel：对网络规模数据集的交互式分析。在第 36 届国际大型数据库会议（VLDB）上，页面 330–339，2010 年 9 月。doi:10.14778/1920841.1920886

[56] Joe Kearney. Understanding Record Shredding: storing nested data in columns. joekearney.co.uk, December 2016. Archived at perma.cc/ZD5N-AX5D
[ 56] Joe Kearney. 理解记录碎片化：在列中存储嵌套数据. joekearney.co.uk, 2016 年 12 月. 存档于 perma.cc/ZD5N-AX5D

[57] Jamie Brandon. A shallow survey of OLAP and HTAP query engines. scattered-thoughts.net, September 2023. Archived at perma.cc/L3KH-J4JF
[ 57] Jamie Brandon. OLAP 和 HTAP 查询引擎的浅显调查。scattered-thoughts.net，2023 年 9 月。存档于 perma.cc/L3KH-J4JF

[58] Benoit Dageville, Thierry Cruanes, Marcin Zukowski, Vadim Antonov, Artin Avanes, Jon Bock, Jonathan Claybaugh, Daniel Engovatov, Martin Hentschel, Jiansheng Huang, Allison W. Lee, Ashish Motivala, Abdul Q. Munir, Steven Pelley, Peter Povinec, Greg Rahn, Spyridon Triantafyllis, and Philipp Unterbrunner. The Snowflake Elastic Data Warehouse. At ACM International Conference on Management of Data (SIGMOD), pages 215–226, June 2016. doi:10.1145/2882903.2903741
[ 58] Benoit Dageville, Thierry Cruanes, Marcin Zukowski, Vadim Antonov, Artin Avanes, Jon Bock, Jonathan Claybaugh, Daniel Engovatov, Martin Hentschel, Jiansheng Huang, Allison W. Lee, Ashish Motivala, Abdul Q. Munir, Steven Pelley, Peter Povinec, Greg Rahn, Spyridon Triantafyllis 和 Philipp Unterbrunner. Snowflake 弹性数据仓库。在 ACM 国际数据管理会议 (SIGMOD) 上，页码 215–226，2016 年 6 月。doi:10.1145/2882903.2903741

[59] Mark Raasveldt and Hannes Mühleisen. Data Management for Data Science Towards Embedded Analytics. At 10th Conference on Innovative Data Systems Research (CIDR), January 2020.
[ 59] Mark Raasveldt 和 Hannes Mühleisen. 数据科学的数据管理：走向嵌入式分析。在第十届创新数据系统研究会议 (CIDR) 上，2020 年 1 月。

[60] Jean-François Im, Kishore Gopalakrishna, Subbu Subramaniam, Mayank Shrivastava, Adwait Tumbde, Xiaotian Jiang, Jennifer Dai, Seunghyun Lee, Neha Pawar, Jialiang Li, and Ravi Aringunram. Pinot: Realtime OLAP for 530 Million Users. At ACM International Conference on Management of Data (SIGMOD), pages 583–594, May 2018. doi:10.1145/3183713.3190661
[ 60] Jean-François Im, Kishore Gopalakrishna, Subbu Subramaniam, Mayank Shrivastava, Adwait Tumbde, Xiaotian Jiang, Jennifer Dai, Seunghyun Lee, Neha Pawar, Jialiang Li, 和 Ravi Aringunram. Pinot: 实时 OLAP 为 5.3 亿用户服务. 发表在 ACM 国际数据管理会议(SIGMOD), 第 583–594 页, 2018 年 5 月. doi:10.1145/3183713.3190661

[61] Fangjin Yang, Eric Tschetter, Xavier Léauté, Nelson Ray, Gian Merlino, and Deep Ganguli. Druid: A Real-time Analytical Data Store. At ACM International Conference on Management of Data (SIGMOD), June 2014. doi:10.1145/2588555.2595631
[ 61] Fangjin Yang, Eric Tschetter, Xavier Léauté, Nelson Ray, Gian Merlino, 和 Deep Ganguli. Druid: 一个实时分析数据存储. 发表在 ACM 国际数据管理会议(SIGMOD), 2014 年 6 月. doi:10.1145/2588555.2595631

[62] Chunwei Liu, Anna Pavlenko, Matteo Interlandi, and Brandon Haynes. Deep Dive into Common Open Formats for Analytical DBMSs. Proceedings of the VLDB Endowment, volume 16, issue 11, pages 3044–3056, July 2023. doi:10.14778/3611479.3611507
[ 62] Chunwei Liu, Anna Pavlenko, Matteo Interlandi, 和 Brandon Haynes. 深入探讨分析型 DBMS 的常见开放格式. VLDB 基金会会议论文集, 第 16 卷, 第 11 期, 第 3044–3056 页, 2023 年 7 月. doi:10.14778/3611479.3611507

[63] Xinyu Zeng, Yulong Hui, Jiahong Shen, Andrew Pavlo, Wes McKinney, and Huanchen Zhang. An Empirical Evaluation of Columnar Storage Formats. Proceedings of the VLDB Endowment, volume 17, issue 2, pages 148–161. doi:10.14778/3626292.3626298
[ 63] Xinyu Zeng, Yulong Hui, Jiahong Shen, Andrew Pavlo, Wes McKinney, 和 Huanchen Zhang. 列式存储格式的实证评估. VLDB 基金会会议论文集, 第 17 卷, 第 2 期, 第 148–161 页. doi:10.14778/3626292.3626298

[64] Weston Pace. Lance v2: A columnar container format for modern data. blog.lancedb.com, April 2024. Archived at perma.cc/ZK3Q-S9VJ
[ 64] Weston Pace. Lance v2：一种用于现代数据的列式容器格式。blog.lancedb.com，2024 年 4 月。存档于 perma.cc/ZK3Q-S9VJ

[65] Yoav Helfman. Nimble, A New Columnar File Format. At VeloxCon, April 2024.
[ 65] Yoav Helfman. Nimble，一种新的列式文件格式。在 VeloxCon，2024 年 4 月。

[66] Wes McKinney. Apache Arrow: High-Performance Columnar Data Framework. At CMU Database Group – Vaccination Database Tech Talks, December 2021.
[ 66] Wes McKinney. Apache Arrow：高性能列式数据框架。在 CMU 数据库组 – 疫苗数据库技术讲座，2021 年 12 月。

[67] Wes McKinney. Python for Data Analysis, 3rd Edition. O’Reilly Media, August 2022. ISBN: 9781098104023
[ 67] Wes McKinney. Python 数据分析，第 3 版。O’Reilly Media，2022 年 8 月。ISBN：9781098104023

[68] Paul Dix. The Design of InfluxDB IOx: An In-Memory Columnar Database Written in Rust with Apache Arrow. At CMU Database Group – Vaccination Database Tech Talks, May 2021.
[ 68] Paul Dix. InfluxDB IOx 的设计：一个用 Rust 和 Apache Arrow 编写的内存列式数据库。发表于 CMU 数据库组 – 疫苗数据库技术讲座，2021 年 5 月。

[69] Carlota Soto and Mike Freedman. Building Columnar Compression for Large PostgreSQL Databases. timescale.com, March 2024. Archived at perma.cc/7KTF-V3EH
[ 69] Carlota Soto 和 Mike Freedman. 为大型 PostgreSQL 数据库构建列式压缩。timescale.com，2024 年 3 月。存档于 perma.cc/7KTF-V3EH

[70] Daniel Lemire, Gregory Ssi‐Yan‐Kai, and Owen Kaser. Consistently faster and smaller compressed bitmaps with Roaring. Software: Practice and Experience, volume 46, issue 11, pages 1547–1569, November 2016. doi:10.1002/spe.2402
[ 70] Daniel Lemire, Gregory Ssi‐Yan‐Kai 和 Owen Kaser. 使用 Roaring 实现一致更快且更小的压缩位图。软件：实践与经验，第 46 卷，第 11 期，1547–1569 页，2016 年 11 月。doi:10.1002/spe.2402

[71] Jaz Volpert. An entire Social Network in 1.6GB (GraphD Part 2). jazco.dev, April 2024. Archived at perma.cc/L27Z-QVMG
[ 71] Jaz Volpert. 一个完整的社交网络仅需 1.6GB（GraphD 第二部分）。jazco.dev，2024 年 4 月。存档于 perma.cc/L27Z-QVMG

[72] Daniel J. Abadi, Peter Boncz, Stavros Harizopoulos, Stratos Idreos, and Samuel Madden. The Design and Implementation of Modern Column-Oriented Database Systems. Foundations and Trends in Databases, volume 5, issue 3, pages 197–280, December 2013. doi:10.1561/1900000024
[ 72] Daniel J. Abadi, Peter Boncz, Stavros Harizopoulos, Stratos Idreos, 和 Samuel Madden. 现代列式数据库系统的设计与实现. 数据库基础与趋势，第 5 卷，第 3 期，页码 197–280，2013 年 12 月。doi:10.1561/1900000024

[73] Andrew Lamb, Matt Fuller, Ramakrishna Varadarajan, Nga Tran, Ben Vandiver, Lyric Doshi, and Chuck Bear. The Vertica Analytic Database: C-Store 7 Years Later. Proceedings of the VLDB Endowment, volume 5, issue 12, pages 1790–1801, August 2012. doi:10.14778/2367502.2367518
[ 73] Andrew Lamb, Matt Fuller, Ramakrishna Varadarajan, Nga Tran, Ben Vandiver, Lyric Doshi, 和 Chuck Bear. Vertica 分析数据库：C-Store 七年后. VLDB 基金会会议录，第 5 卷，第 12 期，页码 1790–1801，2012 年 8 月。doi:10.14778/2367502.2367518

[74] Timo Kersten, Viktor Leis, Alfons Kemper, Thomas Neumann, Andrew Pavlo, and Peter Boncz. Everything You Always Wanted to Know About Compiled and Vectorized Queries But Were Afraid to Ask. Proceedings of the VLDB Endowment, volume 11, issue 13, pages 2209–2222, September 2018. doi:10.14778/3275366.3284966
[ 74] Timo Kersten, Viktor Leis, Alfons Kemper, Thomas Neumann, Andrew Pavlo, 和 Peter Boncz. 你总是想知道的关于编译和向量化查询的所有内容，但又害怕问. VLDB 基金会会议录，第 11 卷，第 13 期，页码 2209–2222，2018 年 9 月。doi:10.14778/3275366.3284966

[75] Forrest Smith. Memory Bandwidth Napkin Math. forrestthewoods.com, February 2020. Archived at perma.cc/Y8U4-PS7N
[ 75] Forrest Smith. 内存带宽的简单计算. forrestthewoods.com，2020 年 2 月。存档于 perma.cc/Y8U4-PS7N

[76] Peter Boncz, Marcin Zukowski, and Niels Nes. MonetDB/X100: Hyper-Pipelining Query Execution. At 2nd Biennial Conference on Innovative Data Systems Research (CIDR), January 2005.
[ 76] Peter Boncz, Marcin Zukowski, 和 Niels Nes. MonetDB/X100: 超级流水线查询执行. 在第二届创新数据系统研究双年会议 (CIDR) 上, 2005 年 1 月.

[77] Jingren Zhou and Kenneth A. Ross. Implementing Database Operations Using SIMD Instructions. At ACM International Conference on Management of Data (SIGMOD), pages 145–156, June 2002. doi:10.1145/564691.564709
[ 77] Jingren Zhou 和 Kenneth A. Ross. 使用 SIMD 指令实现数据库操作. 在 ACM 国际数据管理会议 (SIGMOD) 上, 第 145–156 页, 2002 年 6 月. doi:10.1145/564691.564709

[78] Kevin Bartley. OLTP Queries: Transfer Expensive Workloads to Materialize. materialize.com, August 2024. Archived at perma.cc/4TYM-TYD8
[ 78] Kevin Bartley. OLTP 查询: 转移昂贵的工作负载以进行物化. materialize.com, 2024 年 8 月. 存档于 perma.cc/4TYM-TYD8

[79] Jim Gray, Surajit Chaudhuri, Adam Bosworth, Andrew Layman, Don Reichart, Murali Venkatrao, Frank Pellow, and Hamid Pirahesh. Data Cube: A Relational Aggregation Operator Generalizing Group-By, Cross-Tab, and Sub-Totals. Data Mining and Knowledge Discovery, volume 1, issue 1, pages 29–53, March 2007. doi:10.1023/A:1009726021843
[ 79] Jim Gray, Surajit Chaudhuri, Adam Bosworth, Andrew Layman, Don Reichart, Murali Venkatrao, Frank Pellow, 和 Hamid Pirahesh. 数据立方体: 一种关系聚合运算符，推广了分组、交叉表和小计. 数据挖掘与知识发现, 第 1 卷，第 1 期，第 29–53 页, 2007 年 3 月. doi:10.1023/A:1009726021843

[80] Frank Ramsak, Volker Markl, Robert Fenk, Martin Zirkel, Klaus Elhardt, and Rudolf Bayer. Integrating the UB-Tree into a Database System Kernel. At 26th International Conference on Very Large Data Bases (VLDB), September 2000.
[ 80] Frank Ramsak, Volker Markl, Robert Fenk, Martin Zirkel, Klaus Elhardt, 和 Rudolf Bayer. 将 UB-Tree 集成到数据库系统内核中. 在第 26 届国际大型数据库会议 (VLDB) 上，2000 年 9 月。

[81] Octavian Procopiuc, Pankaj K. Agarwal, Lars Arge, and Jeffrey Scott Vitter. Bkd-Tree: A Dynamic Scalable kd-Tree. At 8th International Symposium on Spatial and Temporal Databases (SSTD), pages 46–65, July 2003. doi:10.1007/978-3-540-45072-6_4
[ 81] Octavian Procopiuc, Pankaj K. Agarwal, Lars Arge, 和 Jeffrey Scott Vitter. Bkd-Tree: 一种动态可扩展的 kd-Tree. 在第 8 届国际空间和时间数据库研讨会 (SSTD) 上，页码 46–65，2003 年 7 月。doi:10.1007/978-3-540-45072-6_4

[82] Joseph M. Hellerstein, Jeffrey F. Naughton, and Avi Pfeffer. Generalized Search Trees for Database Systems. At 21st International Conference on Very Large Data Bases (VLDB), September 1995.
[ 82] Joseph M. Hellerstein, Jeffrey F. Naughton, 和 Avi Pfeffer. 数据库系统的广义搜索树. 在第 21 届国际大型数据库会议 (VLDB) 上，1995 年 9 月。

[83] Isaac Brodsky. H3: Uber’s Hexagonal Hierarchical Spatial Index. eng.uber.com, June 2018. Archived at archive.org
[ 83] Isaac Brodsky. H3: Uber 的六边形分层空间索引. eng.uber.com，2018 年 6 月。存档于 archive.org

[84] Robert Escriva, Bernard Wong, and Emin Gün Sirer. HyperDex: A Distributed, Searchable Key-Value Store. At ACM SIGCOMM Conference, August 2012. doi:10.1145/2377677.2377681
[ 84] Robert Escriva, Bernard Wong 和 Emin Gün Sirer. HyperDex：一个分布式、可搜索的键值存储。在 ACM SIGCOMM 会议，2012 年 8 月。doi:10.1145/2377677.2377681

[85] Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schütze. Introduction to Information Retrieval. Cambridge University Press, 2008. ISBN: 978-0-521-86571-5, available online at nlp.stanford.edu/IR-book
[ 85] Christopher D. Manning, Prabhakar Raghavan, 和 Hinrich Schütze. 信息检索导论. 剑桥大学出版社, 2008. ISBN: 978-0-521-86571-5, 在线可用地址 nlp.stanford.edu/IR-book

[86] Jianguo Wang, Chunbin Lin, Yannis Papakonstantinou, and Steven Swanson. An Experimental Study of Bitmap Compression vs. Inverted List Compression. At ACM International Conference on Management of Data (SIGMOD), pages 993–1008, May 2017. doi:10.1145/3035918.3064007
[ 86] Jianguo Wang, Chunbin Lin, Yannis Papakonstantinou, 和 Steven Swanson. 位图压缩与倒排列表压缩的实验研究. 在 ACM 数据管理国际会议 (SIGMOD) 上，993–1008 页，2017 年 5 月. doi:10.1145/3035918.3064007

[87] Adrien Grand. What is in a Lucene Index? At Lucene/Solr Revolution, November 2013. Archived at perma.cc/Z7QN-GBYY
[ 87] Adrien Grand. Lucene 索引中有什么? 在 Lucene/Solr 革命大会上，2013 年 11 月. 存档于 perma.cc/Z7QN-GBYY

[88] Michael McCandless. Visualizing Lucene’s Segment Merges. blog.mikemccandless.com, February 2011. Archived at perma.cc/3ZV8-72W6
[ 88] Michael McCandless. 可视化 Lucene 的段合并. blog.mikemccandless.com, 2011 年 2 月. 存档于 perma.cc/3ZV8-72W6

[89] Lukas Fittl. Understanding Postgres GIN Indexes: The Good and the Bad. pganalyze.com, December 2021. Archived at perma.cc/V3MW-26H6
[ 89] Lukas Fittl. 理解 Postgres GIN 索引：优点与缺点. pganalyze.com, 2021 年 12 月. 存档于 perma.cc/V3MW-26H6

[90] Jimmy Angelakos. The State of (Full) Text Search in PostgreSQL 12. At FOSDEM, February 2020. Archived at perma.cc/J6US-3WZS
[ 90] Jimmy Angelakos. PostgreSQL 12 中的（全文）文本搜索现状. 在 FOSDEM, 2020 年 2 月. 存档于 perma.cc/J6US-3WZS

[91] Alexander Korotkov. Index support for regular expression search. At PGConf.EU Prague, October 2012. Archived at perma.cc/5RFZ-ZKDQ
[ 91] Alexander Korotkov. 正则表达式搜索的索引支持. 在 PGConf.EU 布拉格, 2012 年 10 月. 存档于 perma.cc/5RFZ-ZKDQ

[92] Michael McCandless. Lucene’s FuzzyQuery Is 100 Times Faster in 4.0. blog.mikemccandless.com, March 2011. Archived at perma.cc/E2WC-GHTW
[ 92] Michael McCandless. Lucene 的 FuzzyQuery 在 4.0 中快 100 倍。blog.mikemccandless.com，2011 年 3 月。存档于 perma.cc/E2WC-GHTW

[93] Steffen Heinz, Justin Zobel, and Hugh E. Williams. Burst Tries: A Fast, Efficient Data Structure for String Keys. ACM Transactions on Information Systems, volume 20, issue 2, pages 192–223, April 2002. doi:10.1145/506309.506312
[ 93] Steffen Heinz, Justin Zobel 和 Hugh E. Williams。Burst Tries：一种快速、高效的字符串键数据结构。ACM 信息系统交易，第 20 卷，第 2 期，页码 192–223，2002 年 4 月。doi:10.1145/506309.506312

[94] Klaus U. Schulz and Stoyan Mihov. Fast String Correction with Levenshtein Automata. International Journal on Document Analysis and Recognition, volume 5, issue 1, pages 67–85, November 2002. doi:10.1007/s10032-002-0082-8
[ 94] Klaus U. Schulz 和 Stoyan Mihov。使用 Levenshtein 自动机进行快速字符串纠正。国际文档分析与识别杂志，第 5 卷，第 1 期，页码 67–85，2002 年 11 月。doi:10.1007/s10032-002-0082-8

[95] Tomas Mikolov, Kai Chen, Greg Corrado, and Jeffrey Dean. Efficient Estimation of Word Representations in Vector Space. At International Conference on Learning Representations (ICLR), May 2013. doi:10.48550/arXiv.1301.3781
[ 95] Tomas Mikolov, Kai Chen, Greg Corrado 和 Jeffrey Dean。在向量空间中高效估计词表示。在国际学习表示会议（ICLR），2013 年 5 月。doi:10.48550/arXiv.1301.3781

[96] Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova. BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. At Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, volume 1, pages 4171–4186, June 2019. doi:10.18653/v1/N19-1423
[ 96] Jacob Devlin, Ming-Wei Chang, Kenton Lee, 和 Kristina Toutanova. BERT：用于语言理解的深度双向变换器的预训练。在北美计算语言学协会会议：人类语言技术，卷 1，页 4171–4186，2019 年 6 月。doi:10.18653/v1/N19-1423

[97] Alec Radford, Karthik Narasimhan, Tim Salimans, and Ilya Sutskever. Improving Language Understanding by Generative Pre-Training. openai.com, June 2018. Archived at perma.cc/5N3C-DJ4C
[ 97] Alec Radford, Karthik Narasimhan, Tim Salimans, 和 Ilya Sutskever. 通过生成预训练提高语言理解。openai.com，2018 年 6 月。存档于 perma.cc/5N3C-DJ4C

[98] Matthijs Douze, Maria Lomeli, and Lucas Hosseini. Faiss indexes. github.com, August 2024. Archived at perma.cc/2EWG-FPBS
[ 98] Matthijs Douze, Maria Lomeli, 和 Lucas Hosseini. Faiss 索引。github.com，2024 年 8 月。存档于 perma.cc/2EWG-FPBS

[99] Varik Matevosyan. Understanding pgvector’s HNSW Index Storage in Postgres. lantern.dev, August 2024. Archived at perma.cc/B2YB-JB59
[ 99] Varik Matevosyan. 理解 pgvector 在 Postgres 中的 HNSW 索引存储。lantern.dev，2024 年 8 月。存档于 perma.cc/B2YB-JB59

[100] Dmitry Baranchuk, Artem Babenko, and Yury Malkov. Revisiting the Inverted Indices for Billion-Scale Approximate Nearest Neighbors. At European Conference on Computer Vision (ECCV), pages 202–216, September 2018. doi:10.1007/978-3-030-01258-8_13
[ 100] Dmitry Baranchuk, Artem Babenko, 和 Yury Malkov. 重新审视亿级规模近似最近邻的倒排索引. 发表在欧洲计算机视觉会议 (ECCV) 上, 页码 202–216, 2018 年 9 月. doi:10.1007/978-3-030-01258-8_13

[101] Yury A. Malkov and Dmitry A. Yashunin. Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs. IEEE Transactions on Pattern Analysis and Machine Intelligence, volume 42, issue 4, pages 824–836, April 2020. doi:10.1109/TPAMI.2018.2889473
[ 101] Yury A. Malkov 和 Dmitry A. Yashunin. 使用层次可导航小世界图进行高效且稳健的近似最近邻搜索. IEEE 模式分析与机器智能汇刊, 第 42 卷, 第 4 期, 页码 824–836, 2020 年 4 月. doi:10.1109/TPAMI.2018.2889473
