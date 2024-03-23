import jsonwebtoken from 'jsonwebtoken'
import { config } from '@server/config'
import { UserRoles } from '@server/entities/user'
import { buildProcedure } from './buildProcedure'

const { tokenKey } = config.auth

const verifyToken = (token: string) => jsonwebtoken.verify(token, tokenKey)

export const authenticatedProcedure = buildProcedure(
  UserRoles.RegistererUser,
  verifyToken
)

export const adminProcedure = buildProcedure(UserRoles.Admin, verifyToken)
