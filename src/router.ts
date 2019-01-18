import { Router } from 'express'
import SwaggerUi from 'swagger-ui-express'
import docs from './swagger.json'

const router = Router()

router.use('/swagger', SwaggerUi.serve)
router.get('/swagger', SwaggerUi.setup(docs))

export default router
