import ImageInsert from '@/components/ImageInsert.vue'
import DescriptionInsert from '@/components/DescriptionInsert.vue'
import ListInsert from '@/components/ListInsert.vue'
import CategoryInsert from './components/CategoryInsert.vue'

export const RecipeItems = {
  help: { component: null },
  image: { component: ImageInsert },
  description: { component: DescriptionInsert },
  list: { component: ListInsert },
  categories: { component: CategoryInsert },
}
