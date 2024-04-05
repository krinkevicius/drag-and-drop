<script setup lang="ts">
import type { CommentWithAuthor } from '@mono/server/src/shared/entities'
import type { PropType } from 'vue'

defineProps({
  comment: { type: Object as PropType<CommentWithAuthor>, required: true },
})
</script>

<template>
  <div class="comment rounded-sm border-2 border-main-blue">
    <div class="boder-b-secondary-blue border-b-2 text-xs">
      Posted by {{ comment.username }} at
      {{
        comment.createdAt
          .toISOString()
          .replace(/T|Z/g, ' ')
          .replace(/\.\d{3}/g, '')
      }}
    </div>
    <div>
      {{ comment.commentText }}
    </div>
  </div>
</template>

<style scoped></style>
