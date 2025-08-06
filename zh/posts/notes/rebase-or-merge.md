# 合入主分支最新代码更改

场景：在一个功能分支上开发（例如叫 feature/xxx），此时 main 分支有了其他开发者的更新。需要把 main 的最新更改合并到你当前的功能分支，以保持最新。

## 方法一：使用 `git merge`（保留历史，简单安全）

```bash
# 确保在你的功能分支上
git checkout feature/xxx 
# 拉取远程 main 分支最新代码
git fetch origin
# 合并 main 分支到当前分支
git merge origin/main
```

这会生成一个 合并提交（merge commit），保留两个分支的提交历史。如果有冲突，Git 会提示你解决冲突。

## 方法二：使用 `git rebase`（保持线性历史，更干净）

```bash
# 确保在你的功能分支上
git checkout feature/xxx
# 拉取远程主分支更新
git fetch origin
# 把当前分支的提交“重放”在 main 分支之后
git rebase origin/main
```

这会把你的提交一个一个地“重放”在 main 最新代码之后，生成一个更干净的提交历史。

如果有冲突，Git 会暂停并提示你解决冲突，解决后：

```bash
git add .
git rebase --continue
```

中途想放弃 rebase：

```bash
git rebase --abort
```

## 如何选择

| 场景 | 推荐方式|
|:--|:--:|
|想保留合并历史、多人协作分支 | git merge|
| 追求提交历史清晰、线性 |git rebase|
| 功能分支尚未推送（或你独立开发） |git rebase 更合适|
| 功能分支已多人共享 | git merge 更安全|

## 总结
