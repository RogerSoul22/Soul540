import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import { getTenantUnit } from '../middleware/tenant';

// Minimal schemas used only for count queries — real schemas live in their own route files.
// Using mongoose.models guards to avoid OverwriteModelError if models are already registered.
const _FranchiseEventSchema = new Schema({ date: String, status: String }, { collection: 'franchiseevents' });
const _FranchiseTaskSchema = new Schema({ status: String }, { collection: 'franchisetasks' });
const _FranchiseEmployeeSchema = new Schema({ status: String }, { collection: 'franchiseemployees' });
const _FranchiseContractorSchema = new Schema({ status: String }, { collection: 'franchisecontractors' });
const _FactoryTaskSchema = new Schema({ status: String }, { collection: 'factorytasks' });
const _FactoryEmployeeSchema = new Schema({ status: String }, { collection: 'factoryemployees' });
const _FactoryContractorSchema = new Schema({ status: String }, { collection: 'factorycontractors' });

const FranchiseEvent = mongoose.models.FranchiseEvent || mongoose.model('FranchiseEvent', _FranchiseEventSchema);
const FranchiseTask = mongoose.models.FranchiseTask || mongoose.model('FranchiseTask', _FranchiseTaskSchema);
const FranchiseEmployee = mongoose.models.FranchiseEmployee || mongoose.model('FranchiseEmployee', _FranchiseEmployeeSchema);
const FranchiseContractor = mongoose.models.FranchiseContractor || mongoose.model('FranchiseContractor', _FranchiseContractorSchema);
const FactoryTask = mongoose.models.FactoryTask || mongoose.model('FactoryTask', _FactoryTaskSchema);
const FactoryEmployee = mongoose.models.FactoryEmployee || mongoose.model('FactoryEmployee', _FactoryEmployeeSchema);
const FactoryContractor = mongoose.models.FactoryContractor || mongoose.model('FactoryContractor', _FactoryContractorSchema);

const router = Router();

router.get('/', async (req, res) => {
  const unit = getTenantUnit(req);
  const now = new Date().toISOString().split('T')[0];

  let totalEvents: number;
  let upcomingEvents: number;
  let pendingTasks: number;
  let activeEmployees: number;
  let totalContractors: number;

  if (unit === 'franchise') {
    [totalEvents, upcomingEvents, pendingTasks, activeEmployees, totalContractors] = await Promise.all([
      FranchiseEvent.countDocuments(),
      FranchiseEvent.countDocuments({ date: { $gte: now }, status: { $nin: ['completed', 'cancelled'] } }),
      FranchiseTask.countDocuments({ status: { $nin: ['done'] } }),
      FranchiseEmployee.countDocuments({ status: 'ativo' }),
      FranchiseContractor.countDocuments({ status: 'ativo' }),
    ]);
  } else if (unit === 'factory') {
    // Factory has no event model yet — report 0 for events.
    [pendingTasks, activeEmployees, totalContractors] = await Promise.all([
      FactoryTask.countDocuments({ status: { $nin: ['done'] } }),
      FactoryEmployee.countDocuments({ status: 'ativo' }),
      FactoryContractor.countDocuments({ status: 'ativo' }),
    ]);
    totalEvents = 0;
    upcomingEvents = 0;
  } else {
    // main tenant
    const Event = mongoose.models.Event || mongoose.model('Event', new Schema({ date: String, status: String }, { collection: 'events' }));
    const Task = mongoose.models.Task || mongoose.model('Task', new Schema({ status: String }, { collection: 'tasks' }));
    const Employee = mongoose.models.Employee || mongoose.model('Employee', new Schema({ status: String }, { collection: 'employees' }));
    const Contractor = mongoose.models.Contractor || mongoose.model('Contractor', new Schema({ status: String }, { collection: 'contractors' }));
    [totalEvents, upcomingEvents, pendingTasks, activeEmployees, totalContractors] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ date: { $gte: now }, status: { $nin: ['completed', 'cancelled'] } }),
      Task.countDocuments({ status: { $nin: ['done'] } }),
      Employee.countDocuments({ status: 'ativo' }),
      Contractor.countDocuments({ status: 'ativo' }),
    ]);
  }

  res.json({ totalEvents, upcomingEvents, pendingTasks, activeEmployees, totalContractors });
});

export default router;
