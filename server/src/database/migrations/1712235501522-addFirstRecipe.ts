import {
  Category,
  Description,
  Image,
  Ingredient,
  IngredientList,
  Quantity,
  Recipe,
} from '@server/entities'
import { MigrationInterface, QueryRunner } from 'typeorm'

const name = 'Chocolate brownie'

const quantityIngredientPairs = [
  {
    quantity: '200g',
    name: 'dark chocolate',
  },
  {
    quantity: '200g',
    name: 'butter',
  },
  {
    quantity: '360g',
    name: 'powdered sugar',
  },
  {
    quantity: '4 large',
    name: 'eggs',
  },
  {
    quantity: '80g',
    name: 'cocoa powder',
  },
  {
    quantity: '60g',
    name: 'flour',
  },
]

export class AddFirstRecipe1712235501522 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const { manager } = queryRunner

    const { id } = await manager.getRepository(Recipe).save({
      name,
      itemIds: [
        '8dbb9472-5614-4b20-816d-067eea9581e3',
        'bd42bfa1-2996-4166-aaf9-8f1583b599cf',
        '77bcd6b1-950e-4a70-932e-739c3f5ed896',
      ],
    })

    const categories = await Promise.all(
      ['dessert', 'chocolate', 'something else'].map(async (c) => {
        const category =
          (await manager
            .getRepository(Category)
            .findOne({ where: { name: c } })) ||
          (await manager.getRepository(Category).save({ name: c }))
        return category
      })
    )

    await manager
      .createQueryBuilder()
      .relation(Recipe, 'categories')
      .of(id)
      .add(categories)

    const list = await manager.getRepository(IngredientList).save({
      id: '8dbb9472-5614-4b20-816d-067eea9581e3',
      recipeId: id,
    })

    await Promise.all(
      quantityIngredientPairs.map(async (pair) => {
        const ingredient =
          (await manager
            .getRepository(Ingredient)
            .findOne({ where: { name: pair.name } })) ||
          (await manager.getRepository(Ingredient).save({ name: pair.name }))

        await manager.getRepository(Quantity).save({
          quantity: pair.quantity,
          ingredientId: ingredient.id,
          ingredientListId: list.id,
        })
      })
    )

    await manager.getRepository(Image).save({
      id: 'bd42bfa1-2996-4166-aaf9-8f1583b599cf',
      imageUrl:
        'https://krinkevicius-wd3-capstone.s3.eu-central-1.amazonaws.com/1f26ffe2-0574-4f62-996b-33ce19bb5348',
      imageName: 'chocolate-brownie-1.jpg',
      recipeId: id,
    })

    await manager.getRepository(Description).save({
      id: '77bcd6b1-950e-4a70-932e-739c3f5ed896',
      descriptionText:
        '<ol><li>Cut butter into small cubes and tip into a medium bowl. Break dark chocolate into small pieces and drop into the bowl.</li><li>Fill a small saucepan about a quarter full with hot water, then sit the bowl on top so it rests on the rim of the pan, not touching the water. Put over a low heat until the butter and chocolate have melted, stirring occasionally to mix them.</li><li>Break 4 large eggs into a large bowl and tip in 360g powdered sugar. With an electric mixer on maximum speed, whisk the eggs and sugar. They will look thick and creamy, like a milk shake. This can take 3-8 minutes, depending on how powerful your mixer is. You’ll know it’s ready when the mixture becomes really pale and about double its original volume.</li><li>Pour the cooled chocolate and butter mixture over the eggy mousse, then gently fold together with a spoon or rubber spatula. Continue folding gently in a figure of eight, moving the bowl round after each folding so you can get at it from all sides, until the two mixtures are one and the colour is a mottled dark brown.</li><li>Hold the sieve over the bowl of eggy chocolate mixture and sift the cocoa and flour. Gently fold in this powder. The mixture will look dry and dusty at first, and a bit unpromising, but if you keep going very gently and patiently, it will end up looking gungy and fudgy. Stop just before you feel you should, as you don’t want to overdo this mixing.</li><li>Pour the mixture into the shallow 20cm square tin lined with baking paper, scraping every bit out of the bowl with the spatula. Gently ease the mixture into the corners of the tin and paddle the spatula from side to side across the top to level it.</li><li>Put in the preheated oven (180C) and bake for 25 mins.</li></ol><p><br></p>',
      recipeId: id,
    })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { manager } = queryRunner

    const list = await manager.getRepository(IngredientList).findOneOrFail({
      where: { id: '8dbb9472-5614-4b20-816d-067eea9581e3' },
      relations: { quantities: true },
    })

    const { quantities } = list

    await Promise.all(
      quantities.map(async (quantity) => {
        await manager.delete(Quantity, quantity.id)
      })
    )

    await manager.delete(Image, 'bd42bfa1-2996-4166-aaf9-8f1583b599cf')
    await manager.delete(Description, '77bcd6b1-950e-4a70-932e-739c3f5ed896')
    await manager.delete(IngredientList, '8dbb9472-5614-4b20-816d-067eea9581e3')
    await queryRunner.query(`DELETE FROM recipe WHERE name='${name}'`)
  }
}
