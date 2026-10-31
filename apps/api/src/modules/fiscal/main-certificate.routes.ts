import { Router } from 'express';
import { logAudit } from '../../infrastructure/audit-log';
import { requireAdmin } from '../../infrastructure/middleware/auth';
import { getTenantUnit } from '../../infrastructure/middleware/tenant';
import {
  getMainCertificateService,
  MainCertificateValidationError,
  type MainCertificateService,
} from './main-certificate.service';

type Audit = typeof logAudit;

export function createMainCertificateRouter(
  service?: Pick<MainCertificateService, 'getMainCertificateSummary' | 'saveMainCertificate' | 'removeMainCertificate'>,
  audit: Audit = logAudit,
) {
  const router = Router();
  const resolveService = () => service ?? getMainCertificateService();
  router.use(requireAdmin);
  router.use((req, res, next) => {
    if (getTenantUnit(req) !== 'main') {
      return res.status(403).json({ error: 'O cofre fiscal pertence ao sistema principal.' });
    }
    next();
  });

  router.get('/', async (_req, res) => {
    try {
      return res.json(await resolveService().getMainCertificateSummary());
    } catch {
      return res.status(500).json({ error: 'Não foi possível carregar o certificado fiscal.' });
    }
  });

  router.put('/', async (req, res) => {
    const certificado = typeof req.body?.certificado === 'string' ? req.body.certificado : '';
    const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';
    if (!certificado.trim() || !senha) {
      return res.status(400).json({ error: 'Certificado e senha são obrigatórios.' });
    }
    try {
      const summary = await resolveService().saveMainCertificate({ certificateBase64: certificado, password: senha });
      await audit({
        req,
        action: 'update',
        resource: 'main-fiscal-certificate',
        description: 'Atualizou o certificado digital A1 da matriz.',
      });
      return res.json(summary);
    } catch (error) {
      if (error instanceof MainCertificateValidationError) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Não foi possível salvar o certificado fiscal.' });
    }
  });

  router.delete('/', async (req, res) => {
    try {
      await resolveService().removeMainCertificate();
      await audit({
        req,
        action: 'delete',
        resource: 'main-fiscal-certificate',
        description: 'Removeu o certificado digital A1 da matriz.',
      });
      return res.status(204).end();
    } catch {
      return res.status(500).json({ error: 'Não foi possível remover o certificado fiscal.' });
    }
  });

  return router;
}
