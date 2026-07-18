import router from '@adonisjs/core/services/router';
import { serviceDescriptor } from '@graphitemd/contracts';
router.get('/api/v1/health', () => serviceDescriptor);
//# sourceMappingURL=routes.js.map