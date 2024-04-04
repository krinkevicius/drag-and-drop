import { MigrationInterface, QueryRunner } from 'typeorm'
import { config } from '@server/config'
import bcrypt from 'bcrypt'

const { email, password } = config.adminCredentials

export class AddAdmin1712168299239 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!email || !password) {
      throw new Error(
        'Admin email and/or password is not set up. Have you forgot to add env variables?'
      )
    }
    const hashedPassword = await bcrypt.hash(password, config.auth.passwordCost)

    await queryRunner.query(
      `INSERT INTO users (email, username, password, role) VALUES ('${email}', 'admin', '${hashedPassword}', 'admin')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!email) {
      throw new Error(
        'Admin email is not set up. Have you forgot to add env variables?'
      )
    }

    await queryRunner.query(`DELETE FROM users WHERE email= '${email}'`)
  }
}
