import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Loader2,
    AlertCircle,
    Copy,
    Check,
    Search,
    Filter
} from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WithdrawalRequest {
    id: string;
    user_id: string;
    wallet_id: string;
    amount: number;
    currency: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    bank_name: string | null;
    status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    user_email?: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-500 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-500 border-red-500/30',
    cancelled: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
};

const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    processing: <Loader2 className="w-4 h-4 animate-spin" />,
    completed: <CheckCircle className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
};

export const AdminWithdrawals: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
    const [updating, setUpdating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRequests = async () => {
        try {
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('withdrawal_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Fetch user emails
            const userIds = [...new Set(data?.map(r => r.user_id) || [])];
            const { data: userData } = await supabase.auth.admin.listUsers();

            const requestsWithEmails = (data || []).map(req => {
                const userInfo = userData?.users?.find(u => u.id === req.user_id);
                return {
                    ...req,
                    user_email: userInfo?.email || 'Unknown',
                };
            });

            setRequests(requestsWithEmails);
        } catch (err: any) {
            console.error('Error fetching requests:', err);
            setError(err.message || 'Failed to load withdrawal requests');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const updateStatus = async (requestId: string, newStatus: string, notes?: string) => {
        setUpdating(true);
        try {
            const { error: updateError } = await supabase
                .from('withdrawal_requests')
                .update({
                    status: newStatus,
                    admin_notes: notes || null,
                    processed_by: user?.id,
                    processed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            // Refresh the list
            await fetchRequests();
            setSelectedRequest(null);
        } catch (err: any) {
            console.error('Error updating status:', err);
            setError(err.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        const matchesSearch =
            req.account_holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.account_number.includes(searchTerm) ||
            req.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-lime-accent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text font-editorial">
                        Withdrawal Requests
                    </h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        Manage user withdrawal requests
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    {pendingCount > 0 && (
                        <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-medium">
                            {pendingCount} Pending
                        </span>
                    )}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2 bg-light-glass dark:bg-dark-glass rounded-lg hover:bg-lime-accent/20 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-500">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500">×</button>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by name, account, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-light-text-secondary" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-light-glass dark:bg-dark-glass border border-light-border dark:border-dark-border rounded-lg text-light-text dark:text-dark-text"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
                        No withdrawal requests found
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-light-surface/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-xl p-6"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Left: Request Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${statusColors[request.status]}`}>
                                            {statusIcons[request.status]}
                                            <span className="capitalize">{request.status}</span>
                                        </span>
                                        <span className="text-2xl font-bold text-lime-accent">
                                            ₹{request.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                        {new Date(request.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {/* Middle: Bank Details */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 lg:px-6">
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Account Holder</p>
                                        <p className="font-medium text-light-text dark:text-dark-text">{request.account_holder_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Account Number</p>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-mono text-light-text dark:text-dark-text">{request.account_number}</p>
                                            <button
                                                onClick={() => copyToClipboard(request.account_number, `acc-${request.id}`)}
                                                className="p-1 hover:bg-light-glass dark:hover:bg-dark-glass rounded"
                                            >
                                                {copiedId === `acc-${request.id}` ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-light-text-secondary" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">IFSC Code</p>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-mono text-light-text dark:text-dark-text">{request.ifsc_code}</p>
                                            <button
                                                onClick={() => copyToClipboard(request.ifsc_code, `ifsc-${request.id}`)}
                                                className="p-1 hover:bg-light-glass dark:hover:bg-dark-glass rounded"
                                            >
                                                {copiedId === `ifsc-${request.id}` ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-light-text-secondary" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">User Email</p>
                                        <p className="text-light-text dark:text-dark-text text-sm">{request.user_email}</p>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center space-x-2">
                                    {request.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(request.id, 'processing')}
                                                disabled={updating}
                                                className="px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
                                            >
                                                Start Processing
                                            </button>
                                            <button
                                                onClick={() => updateStatus(request.id, 'rejected', 'Request rejected by admin')}
                                                disabled={updating}
                                                className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'processing' && (
                                        <button
                                            onClick={() => updateStatus(request.id, 'completed', 'Amount transferred successfully')}
                                            disabled={updating}
                                            className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium flex items-center space-x-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Mark as Completed</span>
                                        </button>
                                    )}
                                    {request.status === 'completed' && (
                                        <span className="text-green-500 text-sm flex items-center space-x-1">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Processed</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {request.admin_notes && (
                                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Admin Notes</p>
                                    <p className="text-sm text-light-text dark:text-dark-text">{request.admin_notes}</p>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
