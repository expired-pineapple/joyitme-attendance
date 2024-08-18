import { withAuthMiddleware } from '@/middlewares/auth.middleware'

import { chain } from '@/middlewares/chain'
import { withChainMiddleware } from '@/middlewares/ip.middleware'

export default chain([withAuthMiddleware])

export const config = {
  matcher: ['/((?!api|reset-password|_next/static|_next/image|images|favicon.ico).*)']
}