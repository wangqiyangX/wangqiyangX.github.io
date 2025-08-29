<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";

const { frontmatter, title, localeIndex, isDark } = useData();

const giscusTheme = computed(() => {
  return isDark.value ? "dark" : "light";
});

const giscusLang = computed(() => {
  switch (localeIndex.value) {
    case "root":
      return "zh-CN";
    case "en":
      return "en";
    default:
      return "zh-CN";
  }
});
</script>

<template>
  <div v-if="frontmatter.comments === true" :key="title" class="giscus">
    <component
      :is="'script'"
      src="https://giscus.app/client.js"
      data-repo="wangqiyangX/wangqiyangX.github.io"
      data-repo-id="R_kgDOPmLWUw"
      data-category="Announcements"
      data-category-id="DIC_kwDOPhIfvs4CuuPT"
      data-mapping="title"
      data-strict="0"
      data-reactions-enabled="1"
      data-emit-metadata="0"
      data-input-position="bottom"
      :data-lang="giscusLang"
      :data-theme="giscusTheme"
      data-loading="lazy"
      async
    />
  </div>
</template>
