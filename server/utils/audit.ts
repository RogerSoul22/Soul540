import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema({
  userId:      { type: String, default: '' },
  userName:    { type: String, default: 'Sistema' },
  userUnit:    { type: String, default: 'main' },
  action:      { type: String, enum: ['create', 'update', 'delete'], required: true },
  resource:    { type: String, required: true },
  resourceId:  { type: String, default: '' },
  description: { type: String, required: true },
  timestamp:   { type: Date, default: () => new Date() },
}, { collection: 'auditlogs', toJSON: { virtuals: true, versionKey: false } });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

interface AuditParams {
  req: any;
  action: 'create' | 'update' | 'delete';
  resource: string;
  resourceId?: string;
  description: string;
}

export async function logAudit({ req, action, resource, resourceId, description }: AuditParams) {
  try {
    const u = (req as any).user;
    await AuditLog.create({
      userId:     u?._id?.toString() || u?.userId || '',
      userName:   u?.name || 'Desconhecido',
      userUnit:   u?.unit || 'main',
      action,
      resource,
      resourceId: resourceId || '',
      description,
    });
  } catch {
    // Never block a request due to audit failure
  }
}
