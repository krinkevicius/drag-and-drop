import ImageInsert from '@/components/ImageInsert.vue'
import DescriptionInsert from '@/components/DescriptionInsert.vue'
import ListInsert from '@/components/ListInsert.vue'
import CategoryInsert from './components/CategoryInsert.vue'

export const RecipeItems = {
  help: { component: null, data: {} },
  image: { component: ImageInsert, data: { image: null, imageName: '' } },
  description: { component: DescriptionInsert, data: { description: '' } },
  list: { component: ListInsert, data: {} },
  categories: { component: CategoryInsert, data: {} },
}
