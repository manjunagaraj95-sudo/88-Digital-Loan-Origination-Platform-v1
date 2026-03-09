
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- I. ABSOLUTE UI/UX LAWS: ELITE UI/UX ARCHITECT ---

// Mock Icon Component for demonstration
const Icon = ({ name, className = '', onClick }) => {
  const icons = {
    dashboard: '📊',
    loans: '💰',
    settings: '⚙️',
    user: '👤',
    search: '🔍',
    home: '🏠',
    arrowRight: '›',
    check: '✅',
    alert: '⚠️',
    edit: '✏️',
    'delete': '🗑️',
    upload: '⬆️',
    history: '📜',
    document: '📄',
    eye: '👁️',
    plus: '➕',
    filter: '🎛️',
    sort: '↕️',
    export: '📤',
    save: '💾',
    close: '✖️',
    info: 'ℹ️',
    activity: '⚡',
    chartBar: '📊',
    chartLine: '📈',
    chartDonut: '🍩',
    chartGauge: '🎯',
  };
  return (
    <span className={`icon icon-${name} ${className}`} onClick={onClick}>
      {icons[name] || ''}
    </span>
  );
};

// --- RBAC Configuration ---
const ROLES = {
  'REQUEST_INITIATOR': {
    name: 'Request Initiator',
    canCreateLoan: true,
    canViewAllLoans: false,
    canViewOwnLoans: true,
    canEditOwnLoan: true,
    canViewAuditLogs: false,
    canApprove: false,
    dashboardWidgets: ['MyPendingLoans', 'RecentActivities'],
    loanActions: ['view', 'edit'],
  },
  'FIELD_ENGINEER': {
    name: 'Field Engineer',
    canCreateLoan: false,
    canViewAllLoans: true,
    canViewOwnLoans: false, // Could be adjusted to view assigned
    canEditOwnLoan: false,
    canViewAuditLogs: false,
    canApprove: false,
    dashboardWidgets: ['AssignedTasks', 'LoanOverview'],
    loanActions: ['view'],
  },
  'PROCUREMENT_MANAGER': {
    name: 'Procurement Manager',
    canCreateLoan: false,
    canViewAllLoans: true,
    canViewOwnLoans: false,
    canEditOwnLoan: false,
    canViewAuditLogs: false,
    canApprove: true,
    dashboardWidgets: ['PendingApprovals', 'SLAStatus'],
    loanActions: ['view', 'approve', 'reject'],
  },
  'OPERATIONS_OFFICER': {
    name: 'Operations Officer',
    canCreateLoan: false,
    canViewAllLoans: true,
    canViewOwnLoans: false,
    canEditOwnLoan: false,
    canViewAuditLogs: true,
    canApprove: true,
    dashboardWidgets: ['PendingApprovals', 'SLAStatus', 'OverallPerformance'],
    loanActions: ['view', 'approve', 'reject'],
  },
  'SYSTEM_ADMINISTRATOR': {
    name: 'System Administrator',
    canCreateLoan: true,
    canViewAllLoans: true,
    canViewOwnLoans: true,
    canEditOwnLoan: true,
    canViewAuditLogs: true,
    canApprove: true,
    dashboardWidgets: ['OverallPerformance', 'SystemHealth', 'AllLoanMetrics'],
    loanActions: ['view', 'edit', 'approve', 'reject', 'delete'],
  },
};

// --- Sample Data ---
const sampleLoans = [
  {
    id: 'L001',
    applicantName: 'Alice Johnson',
    loanAmount: 150000,
    status: 'In Progress',
    submittedDate: '2023-10-26T10:00:00Z',
    lastUpdated: '2023-11-01T14:30:00Z',
    assignedTo: 'Procurement Manager',
    currentStage: 'KYC Validation',
    workflowProgress: [
      { name: 'Application Intake', status: 'Completed', date: '2023-10-26' },
      { name: 'KYC Validation', status: 'Active', date: '2023-10-28' },
      { name: 'Risk Scoring', status: 'Pending', date: null },
      { name: 'Approval', status: 'Pending', date: null },
      { name: 'Disbursement', status: 'Pending', date: null },
    ],
    auditLog: [
      { timestamp: '2023-10-26T10:00:00Z', actor: 'Alice Johnson', action: 'Loan application submitted.' },
      { timestamp: '2023-10-27T09:15:00Z', actor: 'System', action: 'Automated KYC check initiated.' },
      { timestamp: '2023-10-28T11:00:00Z', actor: 'Operations Officer', action: 'Manual KYC validation started.' },
    ],
    documents: [
      { name: 'Application Form.pdf', type: 'PDF', url: '#', uploadedBy: 'Alice Johnson', uploadedDate: '2023-10-26' },
      { name: 'ID Proof.jpg', type: 'Image', url: '#', uploadedBy: 'Alice Johnson', uploadedDate: '2023-10-26' },
    ],
    relatedRecords: [
      { type: 'Customer Profile', id: 'C001', link: '#' },
      { type: 'Credit Report', id: 'CR123', link: '#' },
    ],
    createdBy: 'Alice Johnson',
  },
  {
    id: 'L002',
    applicantName: 'Bob Smith',
    loanAmount: 75000,
    status: 'Approved',
    submittedDate: '2023-10-20T09:30:00Z',
    lastUpdated: '2023-10-25T16:00:00Z',
    assignedTo: null,
    currentStage: 'Disbursement',
    workflowProgress: [
      { name: 'Application Intake', status: 'Completed', date: '2023-10-20' },
      { name: 'KYC Validation', status: 'Completed', date: '2023-10-21' },
      { name: 'Risk Scoring', status: 'Completed', date: '2023-10-23' },
      { name: 'Approval', status: 'Completed', date: '2023-10-24' },
      { name: 'Disbursement', status: 'Active', date: '2023-10-25' },
    ],
    auditLog: [
      { timestamp: '2023-10-20T09:30:00Z', actor: 'Bob Smith', action: 'Loan application submitted.' },
      { timestamp: '2023-10-24T15:00:00Z', actor: 'Procurement Manager', action: 'Loan approved.' },
    ],
    documents: [
      { name: 'Application Form.pdf', type: 'PDF', url: '#', uploadedBy: 'Bob Smith', uploadedDate: '2023-10-20' },
    ],
    relatedRecords: [],
    createdBy: 'Bob Smith',
  },
  {
    id: 'L003',
    applicantName: 'Charlie Brown',
    loanAmount: 200000,
    status: 'Pending',
    submittedDate: '2023-11-01T11:00:00Z',
    lastUpdated: '2023-11-01T11:00:00Z',
    assignedTo: 'Operations Officer',
    currentStage: 'Application Intake',
    workflowProgress: [
      { name: 'Application Intake', status: 'Active', date: '2023-11-01' },
      { name: 'KYC Validation', status: 'Pending', date: null },
      { name: 'Risk Scoring', status: 'Pending', date: null },
      { name: 'Approval', status: 'Pending', date: null },
      { name: 'Disbursement', status: 'Pending', date: null },
    ],
    auditLog: [
      { timestamp: '2023-11-01T11:00:00Z', actor: 'Charlie Brown', action: 'Loan application submitted.' },
    ],
    documents: [],
    relatedRecords: [],
    createdBy: 'Charlie Brown',
  },
  {
    id: 'L004',
    applicantName: 'Diana Prince',
    loanAmount: 50000,
    status: 'Rejected',
    submittedDate: '2023-09-15T14:00:00Z',
    lastUpdated: '2023-09-18T10:00:00Z',
    assignedTo: null,
    currentStage: 'Risk Scoring',
    workflowProgress: [
      { name: 'Application Intake', status: 'Completed', date: '2023-09-15' },
      { name: 'KYC Validation', status: 'Completed', date: '2023-09-16' },
      { name: 'Risk Scoring', status: 'Active', date: '2023-09-17' }, // Status rejected, but stage where it was rejected
      { name: 'Approval', status: 'Rejected', date: '2023-09-18' },
      { name: 'Disbursement', status: 'N/A', date: null },
    ],
    auditLog: [
      { timestamp: '2023-09-15T14:00:00Z', actor: 'Diana Prince', action: 'Loan application submitted.' },
      { timestamp: '2023-09-18T10:00:00Z', actor: 'Operations Officer', action: 'Loan rejected due to high risk score.' },
    ],
    documents: [],
    relatedRecords: [],
    createdBy: 'Diana Prince',
  },
];

// --- Helper Components (Reusable UI Elements) ---

const Breadcrumbs = ({ paths, onNavigate }) => (
  <nav className="breadcrumbs" aria-label="breadcrumb">
    <a href="#" onClick={() => onNavigate('DASHBOARD')} style={{ color: 'var(--text-secondary)' }}>
      <Icon name="home" /> Home
    </a>
    {paths.map((path, index) => (
      <React.Fragment key={index}>
        <span><Icon name="arrowRight" /></span>
        {path.onClick ? (
          <a href="#" onClick={() => onNavigate(path.screen, path.params)}>
            {path.label}
          </a>
        ) : (
          <span>{path.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const Card = ({ children, title, footer, onClick, className = '', headerContent, style }) => (
  <div
    className={`card ${onClick ? 'clickable-card' : ''} ${className}`}
    onClick={onClick}
    style={{ borderRadius: 'var(--radius-lg)', ...style }}
  >
    {title && (
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {headerContent}
      </div>
    )}
    <div className="card-content">{children}</div>
    {footer && <div className="card-footer">{footer}</div>}
  </div>
);

const Button = ({ children, onClick, type = 'primary', icon, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    className={`button button-${type} ${className}`}
    disabled={disabled}
  >
    {icon && <Icon name={icon} />}
    {children}
  </button>
);

const StatusBadge = ({ status }) => {
  const statusClasses = {
    'Approved': 'status-approved',
    'In Progress': 'status-in-progress',
    'Pending': 'status-pending',
    'Rejected': 'status-rejected',
    'Exception': 'status-exception',
    'Active': 'status-in-progress', // For milestone tracking
    'Completed': 'status-approved', // For milestone tracking
  };
  return (
    <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>
      {status}
    </span>
  );
};

const EmptyState = ({ icon = 'info', title, message, actionButton }) => (
  <div className="empty-state">
    <div className="empty-state-icon"><Icon name={icon} /></div>
    <h3>{title}</h3>
    <p>{message}</p>
    {actionButton}
  </div>
);

// --- Detail View Components ---

const MilestoneTracker = ({ workflowProgress }) => {
  const getStageClass = useCallback((status) => {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Active': return 'active';
      case 'Pending': return 'pending';
      case 'Rejected': return 'rejected'; // Could show a distinct style for rejected stage
      default: return '';
    }
  }, []);

  return (
    <Card title="Workflow Progress" style={{ marginBottom: 'var(--spacing-lg)' }}>
      <div className="milestone-tracker">
        {workflowProgress?.map((stage, index) => (
          <div key={stage?.name} className={`milestone-stage ${getStageClass(stage?.status)}`}>
            <div className="milestone-circle">
              {stage?.status === 'Completed' ? <Icon name="check" /> : index + 1}
            </div>
            <div className="milestone-stage-label">
              {stage?.name}
              {stage?.date && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-placeholder)' }}>{stage?.date}</div>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const NewsAuditFeed = ({ auditLog, currentUserRole }) => {
  const getRoleConfig = useCallback((role) => ROLES[role] || {}, []);
  const roleConfig = getRoleConfig(currentUserRole);

  if (!roleConfig?.canViewAuditLogs) {
    return (
      <Card title="Audit Log" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view audit logs for this record.</p>
      </Card>
    );
  }

  return (
    <Card title="News / Audit Feed" style={{ marginBottom: 'var(--spacing-lg)' }}>
      {auditLog?.length > 0 ? (
        auditLog?.map((entry, index) => (
          <div key={index} className="audit-feed-item">
            <div className="audit-icon"><Icon name="activity" /></div>
            <div className="audit-content">
              <strong>{entry?.actor}</strong> {entry?.action}
              <div className="audit-timestamp">{new Date(entry?.timestamp).toLocaleString()}</div>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>No recent activities found.</p>
      )}
    </Card>
  );
};

// --- Screens ---

const LoanFormScreen = ({ loan, onSave, onCancel, currentUserRole }) => {
  const [formData, setFormData] = useState(loan || {
    applicantName: '',
    loanAmount: '',
    status: 'Pending',
    submittedDate: new Date().toISOString(),
    createdBy: currentUserRole, // Simulate who created it
    workflowProgress: [
      { name: 'Application Intake', status: 'Active', date: new Date().toISOString().split('T')[0] },
      { name: 'KYC Validation', status: 'Pending', date: null },
      { name: 'Risk Scoring', status: 'Pending', date: null },
      { name: 'Approval', status: 'Pending', date: null },
      { name: 'Disbursement', status: 'Pending', date: null },
    ],
    auditLog: [{ timestamp: new Date().toISOString(), actor: currentUserRole, action: 'Started new loan application.' }],
    documents: [],
    relatedRecords: [],
  });
  const [errors, setErrors] = useState({});

  const isNewLoan = !loan?.id;
  const roleConfig = ROLES[currentUserRole];

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
  }, []);

  const validateForm = useCallback(() => {
    let newErrors = {};
    if (!formData.applicantName) newErrors.applicantName = 'Applicant Name is mandatory.';
    if (!formData.loanAmount || isNaN(formData.loanAmount) || parseFloat(formData.loanAmount) <= 0) newErrors.loanAmount = 'Loan Amount must be a positive number.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  }, [formData, onSave, validateForm]);

  if (!roleConfig?.canCreateLoan && isNewLoan) {
    return (
      <div className="main-content">
        <EmptyState
          icon="alert"
          title="Access Denied"
          message="You do not have permission to create new loan applications."
          actionButton={<Button onClick={onCancel} type="secondary">Go Back</Button>}
        />
      </div>
    );
  }
  
  if (!roleConfig?.canEditOwnLoan && !isNewLoan) { // Example: only initiator can edit own loan
    // In a real app, you'd check if loan.createdBy === currentUser (or similar)
    if (loan?.createdBy !== currentUserRole && !roleConfig?.canEditAllLoans) {
        return (
            <div className="main-content">
                <EmptyState
                    icon="alert"
                    title="Access Denied"
                    message="You do not have permission to edit this loan application."
                    actionButton={<Button onClick={onCancel} type="secondary">Go Back</Button>}
                />
            </div>
        );
    }
  }


  return (
    <div className="main-content">
      <Card title={isNewLoan ? 'Create New Loan Application' : `Edit Loan Application: ${loan?.id}`}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="applicantName" className="form-label mandatory-field">Applicant Name</label>
            <input
              type="text"
              id="applicantName"
              name="applicantName"
              value={formData.applicantName || ''}
              onChange={handleChange}
              className="form-input"
            />
            {errors.applicantName && <p className="form-error">{errors.applicantName}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="loanAmount" className="form-label mandatory-field">Loan Amount</label>
            <input
              type="number"
              id="loanAmount"
              name="loanAmount"
              value={formData.loanAmount || ''}
              onChange={handleChange}
              className="form-input"
            />
            {errors.loanAmount && <p className="form-error">{errors.loanAmount}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="status" className="form-label">Current Status (Auto-populated)</label>
            <input
              type="text"
              id="status"
              name="status"
              value={formData.status || ''}
              readOnly
              className="form-input"
              style={{ backgroundColor: 'var(--bg-main)' }}
            />
          </div>
          {/* File Upload Placeholder */}
          <div className="form-group">
            <label className="form-label">Documents <span style={{fontSize: 'var(--font-xs)', color: 'var(--text-secondary)'}}>(Max 5MB per file)</span></label>
            <Button type="secondary" icon="upload" onClick={() => alert('File upload functionality here.')}>Upload Documents</Button>
            {formData.documents?.length > 0 && (
              <ul style={{marginTop: 'var(--spacing-sm)', listStyle: 'none'}}>
                {formData.documents.map((doc, index) => (
                  <li key={index} style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)'}}>
                    <Icon name="document" /> {doc.name}
                    <Button type="icon" onClick={() => alert(`Previewing ${doc.name}`)}><Icon name="eye" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-actions">
            <Button type="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit} icon="save">Save Application</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};


const LoanDetailScreen = ({ loan, onNavigate, currentUserRole, onUpdateLoanStatus }) => {
  if (!loan) {
    return (
      <div className="main-content">
        <EmptyState
          icon="alert"
          title="Loan Not Found"
          message="The loan you are looking for does not exist or you do not have access."
          actionButton={<Button onClick={() => onNavigate('DASHBOARD')} type="primary">Go to Dashboard</Button>}
        />
      </div>
    );
  }

  const roleConfig = ROLES[currentUserRole];
  const canEdit = roleConfig?.loanActions?.includes('edit') && (roleConfig?.canEditOwnLoan && loan?.createdBy === currentUserRole || roleConfig?.canEditAllLoans);
  const canApprove = roleConfig?.loanActions?.includes('approve');
  const canReject = roleConfig?.loanActions?.includes('reject');

  const handleApprove = useCallback(() => {
    if (window.confirm(`Are you sure you want to APPROVE loan ${loan?.id}?`)) {
      onUpdateLoanStatus(loan?.id, 'Approved');
      alert(`Loan ${loan?.id} Approved!`);
    }
  }, [loan?.id, onUpdateLoanStatus]);

  const handleReject = useCallback(() => {
    if (window.confirm(`Are you sure you want to REJECT loan ${loan?.id}?`)) {
      onUpdateLoanStatus(loan?.id, 'Rejected');
      alert(`Loan ${loan?.id} Rejected!`);
    }
  }, [loan?.id, onUpdateLoanStatus]);

  return (
    <div className="main-content">
      <Breadcrumbs
        onNavigate={onNavigate}
        paths={[
          { label: 'Loans', screen: 'DASHBOARD' },
          { label: `Loan ${loan?.id}` },
        ]}
      />

      <div className="flex justify-between items-center mb-md">
        <h1 style={{ marginBottom: 0 }}>Loan Application: {loan?.id}</h1>
        <div className="flex gap-md">
          {canEdit && <Button icon="edit" type="secondary" onClick={() => onNavigate('LOAN_FORM', { loanId: loan?.id })}>Edit</Button>}
          {canApprove && loan?.status !== 'Approved' && loan?.status !== 'Rejected' && (
            <Button icon="check" type="primary" onClick={handleApprove}>Approve</Button>
          )}
          {canReject && loan?.status !== 'Approved' && loan?.status !== 'Rejected' && (
            <Button icon="close" type="secondary" onClick={handleReject}>Reject</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-lg" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Card title="Loan Summary">
          <p><strong>Applicant:</strong> {loan?.applicantName}</p>
          <p><strong>Amount:</strong> ${loan?.loanAmount?.toLocaleString()}</p>
          <p><strong>Status:</strong> <StatusBadge status={loan?.status} /></p>
          <p><strong>Submitted:</strong> {new Date(loan?.submittedDate)?.toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(loan?.lastUpdated)?.toLocaleDateString()}</p>
          {loan?.assignedTo && <p><strong>Assigned To:</strong> {loan?.assignedTo}</p>}
        </Card>

        <Card title="Related Records">
          {loan?.relatedRecords?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {loan?.relatedRecords?.map((record, index) => (
                <li key={index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <a href={record?.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm">
                    <Icon name="document" /> {record?.type}: {record?.id}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No related records found.</p>
          )}
        </Card>

        <Card title="Documents">
          {loan?.documents?.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {loan?.documents?.map((doc, index) => (
                <li key={index} style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <Icon name="document" />
                  <span>{doc?.name} ({doc?.type})</span>
                  <Button type="icon" onClick={() => alert(`Previewing ${doc?.name}`)}><Icon name="eye" /></Button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No documents uploaded.</p>
          )}
        </Card>
      </div>

      <MilestoneTracker workflowProgress={loan?.workflowProgress} />
      <NewsAuditFeed auditLog={loan?.auditLog} currentUserRole={currentUserRole} />
    </div>
  );
};


const LoanCard = ({ loan, onCardClick, currentUserRole }) => {
  const getStatusClass = useCallback((status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'In Progress': return 'status-in-progress';
      case 'Pending': return 'status-pending';
      case 'Rejected': return 'status-rejected';
      case 'Exception': return 'status-exception';
      default: return '';
    }
  }, []);

  const roleConfig = ROLES[currentUserRole];
  const canView = roleConfig?.loanActions?.includes('view') && (roleConfig?.canViewOwnLoans && loan?.createdBy === currentUserRole || roleConfig?.canViewAllLoans);
  const canEdit = roleConfig?.loanActions?.includes('edit') && (roleConfig?.canEditOwnLoan && loan?.createdBy === currentUserRole || roleConfig?.canEditAllLoans);

  if (!canView) {
    return null; // Don't render card if user can't view
  }

  const handleEditClick = useCallback((e) => {
    e.stopPropagation(); // Prevent card click from firing
    onCardClick('LOAN_FORM', { loanId: loan?.id });
  }, [loan?.id, onCardClick]);

  return (
    <Card
      onClick={() => onCardClick('LOAN_DETAIL', { loanId: loan?.id })}
      className={`clickable-card realtime-pulse`}
      headerContent={
        <StatusBadge status={loan?.status} />
      }
    >
      <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Loan {loan?.id} - {loan?.applicantName}</h3>
      <p style={{ marginBottom: 'var(--spacing-sm)' }}>Amount: <strong>${loan?.loanAmount?.toLocaleString()}</strong></p>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
        Current Stage: {loan?.currentStage}
      </p>
      <div className="card-footer" style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-light)'}}>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-placeholder)' }}>Last Updated: {new Date(loan?.lastUpdated)?.toLocaleDateString()}</span>
        {canEdit && (
          <Button
            type="icon"
            icon="edit"
            onClick={handleEditClick}
            aria-label={`Edit Loan ${loan?.id}`}
            style={{ marginLeft: 'auto' }} // Push to the right
          />
        )}
      </div>
    </Card>
  );
};


const DashboardScreen = ({ onNavigate, loans, currentUserRole }) => {
  const roleConfig = ROLES[currentUserRole];

  const filteredLoans = useMemo(() => {
    if (roleConfig?.canViewAllLoans) return loans;
    if (roleConfig?.canViewOwnLoans) return loans.filter(loan => loan.createdBy === currentUserRole);
    return [];
  }, [loans, roleConfig, currentUserRole]);

  const pendingApprovals = filteredLoans.filter(loan => loan.status === 'Pending' && loan.assignedTo === roleConfig?.name);
  const inProgressLoans = filteredLoans.filter(loan => loan.status === 'In Progress' && (roleConfig?.canViewAllLoans || loan.createdBy === currentUserRole));
  const myCreatedLoans = filteredLoans.filter(loan => loan.createdBy === currentUserRole);

  const totalLoanAmount = filteredLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);

  const getDashboardWidget = useCallback((widgetName) => {
    switch (widgetName) {
      case 'MyPendingLoans':
        return (
          <Card key="my-pending-loans" title="My Pending Loans" className="realtime-pulse">
            <h2 style={{ color: 'var(--color-primary)' }}>{myCreatedLoans.filter(l => l.status === 'Pending').length}</h2>
            <p>Loans awaiting action from others.</p>
          </Card>
        );
      case 'PendingApprovals':
        return (
          <Card key="pending-approvals" title="Pending Approvals" className="realtime-pulse">
            <h2 style={{ color: 'var(--color-pending-border)' }}>{pendingApprovals.length}</h2>
            <p>Loans requiring your approval.</p>
            {pendingApprovals.length > 0 && <Button type="primary" onClick={() => alert('Navigate to approval queue')}>Review Now</Button>}
          </Card>
        );
      case 'AssignedTasks':
        return (
          <Card key="assigned-tasks" title="Assigned Tasks" className="realtime-pulse">
            <h2 style={{ color: 'var(--color-in-progress-border)' }}>{filteredLoans.filter(l => l.assignedTo === currentUserRole && l.status === 'In Progress').length}</h2>
            <p>Tasks assigned to you.</p>
          </Card>
        );
      case 'OverallPerformance':
        return (
          <Card key="overall-performance" title="Overall Loan Value" className="realtime-pulse">
            <h2 style={{ color: 'var(--color-accent)' }}>${totalLoanAmount.toLocaleString()}</h2>
            <p>Total value of {filteredLoans.length} loans.</p>
            <div className="chart-placeholder">Bar Chart Placeholder</div>
          </Card>
        );
      case 'SLAStatus':
        return (
          <Card key="sla-status" title="SLA Breaches" className="realtime-pulse">
            <h2 style={{ color: 'var(--color-rejected-border)' }}>0</h2> {/* Mock value */}
            <p>Critical SLA breaches today.</p>
            <div className="chart-placeholder">Gauge Chart Placeholder</div>
          </Card>
        );
      case 'RecentActivities':
        return (
          <Card key="recent-activities" title="Recent Activities" className="realtime-pulse">
            <p>Showing last 5 activities (global/role-specific).</p>
            <NewsAuditFeed auditLog={sampleLoans.slice(0,2).flatMap(loan => loan.auditLog).slice(0, 5)} currentUserRole={currentUserRole} />
            <Button type="secondary" onClick={() => alert('View All Activities')}>View All</Button>
          </Card>
        );
      case 'LoanOverview':
        return (
          <Card key="loan-overview" title="Loan Status Overview">
            <div className="chart-placeholder">Donut Chart Placeholder (Approved vs Rejected)</div>
          </Card>
        );
      case 'SystemHealth':
        return (
          <Card key="system-health" title="System Health" className="realtime-pulse">
            <p>All services operational.</p>
            <div className="chart-placeholder">Line Chart Placeholder</div>
          </Card>
        );
      case 'AllLoanMetrics':
        return (
          <Card key="all-loan-metrics" title="All Loan Metrics">
            <h2 style={{ color: 'var(--text-main)' }}>{filteredLoans.length} Loans</h2>
            <p>Breakdown of loan statuses and amounts.</p>
            <div className="chart-placeholder">Advanced Dashboard Chart</div>
          </Card>
        );
      default: return null;
    }
  }, [filteredLoans, pendingApprovals.length, totalLoanAmount, currentUserRole, myCreatedLoans.length]);

  return (
    <div className="main-content">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Welcome, {currentUserRole}!</h1>

      {/* Dynamic Dashboard Widgets based on Role */}
      <div className="grid grid-cols-4 gap-lg" style={{ marginBottom: 'var(--spacing-xxl)' }}>
        {roleConfig?.dashboardWidgets?.map(widget => getDashboardWidget(widget))}
      </div>

      <div className="flex justify-between items-center mb-md">
        <h2>Your Loans</h2>
        {roleConfig?.canCreateLoan && (
          <Button icon="plus" type="primary" onClick={() => onNavigate('LOAN_FORM')}>
            Create New Loan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-lg">
        {filteredLoans.length > 0 ? (
          filteredLoans.map(loan => (
            <LoanCard key={loan?.id} loan={loan} onCardClick={onNavigate} currentUserRole={currentUserRole} />
          ))
        ) : (
          <div style={{gridColumn: '1 / -1'}}>
            <EmptyState
              icon="loans"
              title="No Loans Found"
              message="It looks like there are no loan applications relevant to your role yet. Start by creating one!"
              actionButton={roleConfig?.canCreateLoan && <Button onClick={() => onNavigate('LOAN_FORM')} type="primary">Create New Loan</Button>}
            />
          </div>
        )}
      </div>
    </div>
  );
};


const App = () => {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  // Simulate user login: 'REQUEST_INITIATOR', 'PROCUREMENT_MANAGER', 'OPERATIONS_OFFICER', 'SYSTEM_ADMINISTRATOR'
  const [currentUserRole, setCurrentUserRole] = useState('PROCUREMENT_MANAGER');
  const [loans, setLoans] = useState(sampleLoans);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useCallback((screen, params = {}) => {
    setView({ screen, params });
  }, []);

  const currentLoan = useMemo(() => {
    if (view.params?.loanId) {
      return loans.find(loan => loan.id === view.params.loanId);
    }
    return null;
  }, [view.params?.loanId, loans]);

  const handleSaveLoan = useCallback((newLoanData) => {
    setLoans(prevLoans => {
      if (newLoanData.id) {
        // Update existing loan
        return prevLoans.map(loan =>
          loan.id === newLoanData.id ? { ...loan, ...newLoanData, lastUpdated: new Date().toISOString() } : loan
        );
      } else {
        // Create new loan
        const newId = `L${(prevLoans.length + 1).toString().padStart(3, '0')}`;
        return [...prevLoans, { ...newLoanData, id: newId, status: 'Pending', lastUpdated: new Date().toISOString() }];
      }
    });
    navigate('DASHBOARD'); // Go back to dashboard after saving
    alert('Loan saved successfully!');
  }, [navigate]);

  const handleUpdateLoanStatus = useCallback((loanId, newStatus) => {
    setLoans(prevLoans => prevLoans.map(loan => {
      if (loan.id === loanId) {
        const updatedLoan = {
          ...loan,
          status: newStatus,
          lastUpdated: new Date().toISOString(),
          auditLog: [...loan.auditLog, {
            timestamp: new Date().toISOString(),
            actor: currentUserRole,
            action: `Loan status changed to ${newStatus}.`
          }],
          // Update workflow progress if status dictates
          workflowProgress: loan.workflowProgress.map(stage => {
            if (newStatus === 'Approved' && stage.name === 'Approval' && stage.status === 'Pending') {
              return { ...stage, status: 'Completed', date: new Date().toISOString().split('T')[0] };
            }
            if (newStatus === 'Rejected' && stage.name === 'Approval' && stage.status === 'Pending') {
              return { ...stage, status: 'Rejected', date: new Date().toISOString().split('T')[0] };
            }
            return stage;
          })
        };
        // If approved, update next stage to active (e.g., Disbursement)
        if (newStatus === 'Approved') {
          const disbursementStage = updatedLoan.workflowProgress.find(s => s.name === 'Disbursement');
          if (disbursementStage && disbursementStage.status === 'Pending') {
            disbursementStage.status = 'Active';
          }
        }
        return updatedLoan;
      }
      return loan;
    }));
    navigate('LOAN_DETAIL', { loanId }); // Stay on detail view or go back to dashboard
  }, [currentUserRole, navigate]);


  // Global Search logic (simplified)
  const handleGlobalSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    // In a real app, this would trigger a search results screen or filter current view
  }, []);

  // Conditional Rendering for Main Content
  const renderScreen = useCallback(() => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen onNavigate={navigate} loans={loans} currentUserRole={currentUserRole} />;
      case 'LOAN_DETAIL':
        return <LoanDetailScreen loan={currentLoan} onNavigate={navigate} currentUserRole={currentUserRole} onUpdateLoanStatus={handleUpdateLoanStatus} />;
      case 'LOAN_FORM':
        return <LoanFormScreen loan={currentLoan} onSave={handleSaveLoan} onCancel={() => navigate('DASHBOARD')} currentUserRole={currentUserRole} />;
      default:
        return (
          <div className="main-content">
            <EmptyState
              icon="alert"
              title="Page Not Found"
              message="The page you are looking for does not exist."
              actionButton={<Button onClick={() => navigate('DASHBOARD')} type="primary">Go to Dashboard</Button>}
            />
          </div>
        );
    }
  }, [view.screen, navigate, loans, currentLoan, currentUserRole, handleSaveLoan, handleUpdateLoanStatus]);

  return (
    <div className="app-container">
      {/* Header with Global Search and User Info */}
      <header className="header">
        <div className="header-logo" onClick={() => navigate('DASHBOARD')} style={{ cursor: 'pointer' }}>
          Digital Loan Origination
        </div>
        <div className="header-nav">
          <div className="global-search-container">
            <Icon name="search" style={{ position: 'absolute', left: 'var(--spacing-sm)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-placeholder)' }} />
            <input
              type="text"
              className="global-search-input"
              placeholder="Search loans, applicants, documents..."
              value={searchTerm}
              onChange={handleGlobalSearch}
              style={{ paddingLeft: 'calc(var(--spacing-sm) + 1.5em)' }}
            />
          </div>
          <a href="#" className="header-nav-item" onClick={() => navigate('DASHBOARD')}>Dashboard</a>
          <a href="#" className="header-nav-item" onClick={() => navigate('DASHBOARD')}>Loans</a> {/* All loans can link to dashboard and be filtered */}
          <div className="header-user-menu">
            <div className="header-user-avatar">{currentUserRole.charAt(0)}</div>
            <span>{ROLES[currentUserRole]?.name || currentUserRole}</span>
          </div>
          <select
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value)}
            style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-main)',
              color: 'var(--text-main)',
              marginLeft: 'var(--spacing-sm)'
            }}
          >
            {Object.keys(ROLES).map(roleKey => (
              <option key={roleKey} value={roleKey}>
                {ROLES[roleKey].name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      {renderScreen()}
    </div>
  );
};

export default App;