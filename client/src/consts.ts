import ImageInsert from '@/components/ImageInsert.vue'
import SingleRecipeImage from '@/components/singleRecipe/SingleRecipeImage.vue'
import DescriptionInsert from '@/components/DescriptionInsert.vue'
import SingleRecipeDescription from '@/components/singleRecipe/SingleRecipeDescription.vue'
import ListInsert from '@/components/ListInsert.vue'
import SingleRecipeIngredientList from '@/components/singleRecipe/SingleRecipeIngredientList.vue'
import CategoryInsert from './components/CategoryInsert.vue'
import SingleRecipeCategories from '@/components/singleRecipe/SingleRecipeCategories.vue'

export const recipeItemsDefault = {
  help: { component: null, data: {} },
  image: {
    component: ImageInsert,
    singleRecipeComponent: SingleRecipeImage,
    data: { imageUrl: '', imageName: '' },
  },
  description: {
    component: DescriptionInsert,
    singleRecipeComponent: SingleRecipeDescription,
    data: { descriptionText: '' },
  },
  ingredientList: {
    component: ListInsert,
    singleRecipeComponent: SingleRecipeIngredientList,
    data: { quantityIngredientPairs: [] },
  },
  categories: {
    component: CategoryInsert,
    singleRecipeComponent: SingleRecipeCategories,
    data: { categories: [] },
  },
}
