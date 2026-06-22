import { useState } from 'react';
import { UserCog, Shield, Activity, Plus, Key, Edit, Trash2, X, ShieldAlert } from 'lucide-react';
import { generateEmployees, saveEmployees, timeAgo } from '../../mock/data';

const roleColors: Record<string, string> = {
  'Super Admin': 'badge-purple',
  'Admin': 'badge-primary',
  'Manager': 'badge-info',
  'Staff': 'badge-success',
  'Support Agent': 'badge-warning',
  'Delivery Agent': 'badge-secondary',
};

const statusColors: Record<string, string> = {
  active: 'status-dot online',
  inactive: 'status-dot offline',
  suspended: 'status-dot busy',
};

const availablePermissions = [
  { id: 'dashboard', label: 'Dashboard Overview' },
  { id: 'analytics', label: 'Advanced Analytics' },
  { id: 'orders', label: 'Order Processing' },
  { id: 'products', label: 'Product Control Center' },
  { id: 'marketing', label: 'Marketing Campaigns' },
  { id: 'finance', label: 'Financial Management' },
  { id: 'settings', label: 'System Settings' }
];

export default function Employees() {
  const [employees, setEmployees] = useState(generateEmployees(20));
  const [activeTab, setActiveTab] = useState('directory');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // Add Employee Form States
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Super Admin' | 'Admin' | 'Manager' | 'Staff' | 'Support Agent' | 'Delivery Agent'>('Staff');
  const [newDept, setNewDept] = useState('Operations');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [newPerms, setNewPerms] = useState<string[]>(['dashboard']);

  const tabs = [
    { id: 'directory', label: 'Employee Directory', icon: UserCog },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ];

  // Audit Logs Data
  const [auditLogs] = useState([
    { id: 1, time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), user: 'Super Admin', action: 'System Login', details: 'Successful administrator login from IP 192.168.1.15', severity: 'low' },
    { id: 2, time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), user: 'Super Admin', action: 'Update Permissions', details: 'Modified access matrix for Emily Rodriguez', severity: 'medium' },
    { id: 3, time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), user: 'Sarah Jenkins', action: 'Edit Product', details: 'Modified stock values for Dell XPS 13 Plus', severity: 'low' },
    { id: 4, time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), user: 'Michael Chang', action: 'Process Payout', details: 'Disbursed payout to TechHub Distributing (৳45,000.00)', severity: 'medium' },
    { id: 5, time: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), user: 'Emily Rodriguez', action: 'Create Coupon', details: 'Created promo discount coupon code SUMMER20', severity: 'low' },
    { id: 6, time: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), user: 'System Guard', action: 'API Key Revoked', details: 'Revoked developer API key #3 due to 90 days inactivity', severity: 'high' }
  ]);

  // Handle Add Employee
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newEmp: any = {
      id: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDept,
      status: newStatus,
      avatar: newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'E',
      lastLogin: new Date().toISOString(),
      permissions: newRole === 'Super Admin' ? ['all'] : newPerms
    };

    const updatedList = [...employees, newEmp];
    setEmployees(updatedList);
    saveEmployees(updatedList);

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewRole('Staff');
    setNewDept('Operations');
    setNewStatus('active');
    setNewPerms(['dashboard']);
    setShowAddModal(false);
  };

  // Handle Edit Employee Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedList = employees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp);
    setEmployees(updatedList);
    saveEmployees(updatedList);
    setEditingEmployee(null);
  };

  // Handle Delete Employee
  const handleDeleteEmployee = (emp: any) => {
    if (confirm(`Are you sure you want to delete ${emp.name}?`)) {
      const updatedList = employees.filter(e => e.id !== emp.id);
      setEmployees(updatedList);
      saveEmployees(updatedList);
    }
  };

  // Toggle permission checkbox in Add / Edit forms
  const togglePerm = (permId: string, isEditing: boolean) => {
    if (isEditing) {
      const currentPerms = editingEmployee.permissions || [];
      const updated = currentPerms.includes(permId)
        ? currentPerms.filter((p: string) => p !== permId)
        : [...currentPerms, permId];
      setEditingEmployee({ ...editingEmployee, permissions: updated });
    } else {
      setNewPerms(prev => prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-breadcrumb"><span>Home</span><span className="page-breadcrumb-sep">/</span><span>Employees</span></div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">Manage staff access, roles, and monitor activity</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => setActiveTab('roles')}><Shield size={16} /> Roles Setup</button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Employee</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'directory' && (
        <div className="data-table-container">
          <div className="data-table-header">
            <div className="data-table-title">Staff Directory</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                        {employee.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{employee.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleColors[employee.role] || 'badge-secondary'}`}>{employee.role}</span></td>
                  <td>{employee.department}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className={statusColors[employee.status]} />
                      <span style={{ fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>{employee.status}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>{timeAgo(employee.lastLogin)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-ghost btn-sm" title="Edit Employee" onClick={() => setEditingEmployee(employee)}><Edit size={14} /></button>
                      <button className="btn btn-ghost btn-sm" title="Manage Access" onClick={() => setEditingEmployee(employee)}><Key size={14} /></button>
                      {employee.role !== 'Super Admin' && (
                        <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteEmployee(employee)}><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Permission Matrix</div></div>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Configure what each role can access and modify within the admin panel.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th style={{ textAlign: 'center' }}>Super Admin</th>
                    <th style={{ textAlign: 'center' }}>Admin</th>
                    <th style={{ textAlign: 'center' }}>Manager</th>
                    <th style={{ textAlign: 'center' }}>Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {['Dashboard', 'Analytics', 'Orders', 'Customers', 'Products', 'Vendors', 'Marketing', 'System Settings'].map((module, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{module}</td>
                      <td style={{ textAlign: 'center' }}><span className="badge badge-success">Full</span></td>
                      <td style={{ textAlign: 'center' }}>
                        {module === 'System Settings' ? <span className="badge badge-danger">None</span> : <span className="badge badge-success">Full</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {['Dashboard', 'Orders', 'Products', 'Customers'].includes(module) ? <span className="badge badge-warning">Read/Write</span> : 
                         ['Analytics', 'Marketing'].includes(module) ? <span className="badge badge-info">Read Only</span> : <span className="badge badge-danger">None</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {['Orders', 'Products'].includes(module) ? <span className="badge badge-warning">Read/Write</span> : 
                         ['Dashboard', 'Customers'].includes(module) ? <span className="badge badge-info">Read Only</span> : <span className="badge badge-danger">None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="data-table-container">
          <div className="data-table-header">
            <div className="data-table-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} className="text-primary" /> Security Audit Log
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Employee / User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(log.time).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.user}</td>
                  <td><span style={{ fontWeight: 500 }}>{log.action}</span></td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{log.details}</td>
                  <td>
                    <span className={`badge ${log.severity === 'high' ? 'badge-danger' : log.severity === 'medium' ? 'badge-warning' : 'badge-primary'}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add New Employee</span>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@vipcommerce.com" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Role Title</label>
                    <select className="form-select" value={newRole} onChange={e => setNewRole(e.target.value as any)}>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                      <option value="Support Agent">Support Agent</option>
                      <option value="Delivery Agent">Delivery Agent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-input" value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="Operations / Marketing" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Access Status</label>
                  <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value as any)}>
                    <option value="active">Active (Granted Access)</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended (Blocked Access)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '12px' }}>Permissions / Module Access Scope</label>
                  <div className="grid-2" style={{ gap: '8px', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    {availablePermissions.map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        <input type="checkbox" className="form-checkbox" checked={newRole === 'Super Admin' || newPerms.includes(p.id)} disabled={newRole === 'Super Admin'} onChange={() => togglePerm(p.id, false)} />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / ACCESS CONTROL MODAL */}
      {editingEmployee && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Edit: {editingEmployee.name} ({editingEmployee.role})</span>
              <button onClick={() => setEditingEmployee(null)} style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" required value={editingEmployee.name} onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" required value={editingEmployee.email} onChange={e => setEditingEmployee({ ...editingEmployee, email: e.target.value })} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Role Title</label>
                    <select className="form-select" value={editingEmployee.role} onChange={e => setEditingEmployee({ ...editingEmployee, role: e.target.value })}>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                      <option value="Support Agent">Support Agent</option>
                      <option value="Delivery Agent">Delivery Agent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-input" value={editingEmployee.department} onChange={e => setEditingEmployee({ ...editingEmployee, department: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Access Status</label>
                  <select className="form-select" value={editingEmployee.status} onChange={e => setEditingEmployee({ ...editingEmployee, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '12px' }}>Access Scope / Permissions</label>
                  <div className="grid-2" style={{ gap: '8px', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                    {availablePermissions.map(p => (
                      <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        <input type="checkbox" className="form-checkbox" checked={editingEmployee.role === 'Super Admin' || (editingEmployee.permissions || []).includes(p.id)} disabled={editingEmployee.role === 'Super Admin'} onChange={() => togglePerm(p.id, true)} />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingEmployee(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
