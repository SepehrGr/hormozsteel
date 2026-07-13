'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Phone,
  Mail,
  User,
  Building2,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Filter,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';

// Types
interface ContactFormSubmission {
  id: string;
  name: string;
  email?: string;
  phone: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

interface QuickOrderSubmission {
  id: string;
  customerName: string;
  companyName?: string;
  phoneNumber: string;
  city: string;
  productSpecs: string;
  quantity: string;
  deliveryDate?: string;
  deliveryMethod: 'pickup' | 'delivery';
  additionalNotes?: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
}

export default function OrdersManagementPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'quick'>('quick');
  const [contactForms, setContactForms] = useState<ContactFormSubmission[]>([]);
  const [quickOrders, setQuickOrders] = useState<QuickOrderSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // برای فیلتر واقعی
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch contact forms from API
  const fetchContactForms = async () => {
    try {
      const response = await fetch(`/api/contact?status=${statusFilter}`);
      const data = await response.json();

      if (data.success) {
        const forms = data.data.contactForms.map((form: any) => ({
          id: form.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          createdAt: form.createdAt,
          status: form.status.toLowerCase(),
        }));
        setContactForms(forms);
      }
    } catch (error) {
      console.error('Error fetching contact forms:', error);
    }
  };

  // Fetch quick orders from API
  const fetchQuickOrders = async () => {
    try {
      const response = await fetch(`/api/quick-orders?status=${statusFilter}`);
      const data = await response.json();

      if (data.success) {
        const orders = data.data.quickOrders.map((order: any) => ({
          id: order.id,
          customerName: order.customerName,
          companyName: order.companyName,
          phoneNumber: order.phoneNumber,
          city: order.city,
          productSpecs: order.productSpecs,
          quantity: order.quantity,
          deliveryDate: order.deliveryDate,
          deliveryMethod: order.deliveryMethod.toLowerCase(),
          additionalNotes: order.additionalNotes,
          createdAt: order.createdAt,
          status: order.status.toLowerCase(),
        }));
        setQuickOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching quick orders:', error);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchContactForms(), fetchQuickOrders()]);
      setLoading(false);
    };

    loadData();
  }, [statusFilter]); // Delete contact form
  const handleDeleteContactForm = async (id: string) => {
    if (!confirm('آیا از حذف این فرم اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchContactForms();
      } else {
        alert('خطا در حذف فرم');
      }
    } catch (error) {
      console.error('Error deleting contact form:', error);
      alert('خطا در حذف فرم');
    }
  };

  // Mark contact form as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'READ' }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchContactForms();
      }
    } catch (error) {
      console.error('Error updating contact form:', error);
    }
  };

  // Delete quick order
  const handleDeleteQuickOrder = async (id: string) => {
    if (!confirm('آیا از حذف این سفارش اطمینان دارید؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/quick-orders?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchQuickOrders();
      } else {
        alert('خطا در حذف سفارش');
      }
    } catch (error) {
      console.error('Error deleting quick order:', error);
      alert('خطا در حذف سفارش');
    }
  };

  // Update quick order status
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/quick-orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchQuickOrders();
      } else {
        alert('خطا در بروزرسانی وضعیت');
      }
    } catch (error) {
      console.error('Error updating quick order:', error);
      alert('خطا در بروزرسانی وضعیت');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'جدید', color: 'bg-blue-500' },
      read: { label: 'خوانده شده', color: 'bg-gray-500' },
      replied: { label: 'پاسخ داده شده', color: 'bg-green-500' },
      pending: { label: 'در انتظار', color: 'bg-yellow-500' },
      confirmed: { label: 'تایید شده', color: 'bg-blue-500' },
      processing: { label: 'در حال پردازش', color: 'bg-purple-500' },
      completed: { label: 'تکمیل شده', color: 'bg-green-500' },
      cancelled: { label: 'لغو شده', color: 'bg-red-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} text-white border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      new: <Mail className="w-4 h-4" />,
      read: <Eye className="w-4 h-4" />,
      replied: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      processing: <RefreshCw className="w-4 h-4" />,
      completed: <Package className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };

    return icons[status as keyof typeof icons];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const filteredContactForms = contactForms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.email &&
        form.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      form.phone.includes(searchQuery) ||
      form.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredQuickOrders = quickOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phoneNumber.includes(searchQuery) ||
      order.productSpecs.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-6 py-8 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-xl">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              مدیریت سفارشات
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              مشاهده و مدیریت سفارشات دریافتی
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  سفارشات سریع
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {quickOrders.length}
                </p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  فرم‌های تماس
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {contactForms.length}
                </p>
              </div>
              <Mail className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  در انتظار پردازش
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {quickOrders.filter((o) => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  تکمیل شده امروز
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  0
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('quick')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'quick'
              ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/50'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Package className="w-5 h-5" />
          سفارشات سریع
          <Badge className="text-white border-0 bg-white/20">
            {quickOrders.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'contact'
              ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Mail className="w-5 h-5" />
          فرم‌های تماس
          <Badge className="text-white border-0 bg-white/20">
            {contactForms.length}
          </Badge>
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="جستجو..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setSearchQuery(searchTerm);
                    }
                  }}
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  classNames={{
                    input: 'text-right',
                    inputWrapper: 'border-gray-300 hover:border-blue-500 h-10',
                  }}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setSearchQuery(searchTerm)}
                  className="w-10 h-10"
                >
                  <Search className="w-4 h-4" />
                </Button>
                {searchTerm && (
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSearchQuery('');
                    }}
                    className="w-10 h-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                placeholder="فیلتر وضعیت"
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  setStatusFilter(selected as string);
                }}
                startContent={<Filter className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                classNames={{
                  trigger: 'border-gray-300 hover:border-blue-500 h-10',
                  value: 'text-right',
                }}
              >
                <SelectItem key="all">همه وضعیت‌ها</SelectItem>
                {activeTab === 'quick' ? (
                  <>
                    <SelectItem key="pending">در انتظار</SelectItem>
                    <SelectItem key="confirmed">تایید شده</SelectItem>
                    <SelectItem key="processing">در حال پردازش</SelectItem>
                    <SelectItem key="completed">تکمیل شده</SelectItem>
                    <SelectItem key="cancelled">لغو شده</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem key="new">جدید</SelectItem>
                    <SelectItem key="read">خوانده شده</SelectItem>
                    <SelectItem key="replied">پاسخ داده شده</SelectItem>
                  </>
                )}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'quick' ? (
        /* Quick Orders List */
        <div className="space-y-4">
          {filteredQuickOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  هیچ سفارش سریعی یافت نشد
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredQuickOrders.map((order) => (
              <Card
                key={order.id}
                className="transition-all border-r-4 hover:shadow-lg border-r-blue-500"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Customer Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">
                          {order.customerName}
                        </span>
                      </div>
                      {order.companyName && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span>{order.companyName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="dir-ltr">{order.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{order.city}</span>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <Package className="w-4 h-4 mt-1 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            مشخصات محصول
                          </p>
                          <p className="font-semibold">{order.productSpecs}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <span>مقدار: {order.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Truck className="w-4 h-4 text-cyan-500" />
                        <span>
                          {order.deliveryMethod === 'delivery'
                            ? 'ارسال به آدرس'
                            : 'تحویل حضوری'}
                        </span>
                      </div>
                      {order.deliveryDate && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 text-pink-500" />
                          <span>{formatDate(order.deliveryDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions & Notes */}
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          تاریخ ثبت
                        </p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      {order.additionalNotes && (
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <p className="mb-1 text-xs text-yellow-700 dark:text-yellow-400">
                            یادداشت
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {order.additionalNotes}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        {/* Status Change Buttons */}
                        {order.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-700 bg-blue-50 hover:bg-blue-100"
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, 'CONFIRMED')
                            }
                          >
                            <CheckCircle className="w-4 h-4 ml-2" />
                            تایید سفارش
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-700 bg-purple-50 hover:bg-purple-100"
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, 'PROCESSING')
                            }
                          >
                            <RefreshCw className="w-4 h-4 ml-2" />
                            شروع پردازش
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 bg-green-50 hover:bg-green-100"
                            onClick={() =>
                              handleUpdateOrderStatus(order.id, 'COMPLETED')
                            }
                          >
                            <CheckCircle className="w-4 h-4 ml-2" />
                            تکمیل سفارش
                          </Button>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteQuickOrder(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Contact Forms List */
        <div className="space-y-4">
          {filteredContactForms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  هیچ فرم تماسی یافت نشد
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredContactForms.map((form) => (
              <Card
                key={form.id}
                className="transition-all border-r-4 hover:shadow-lg border-r-green-500"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* User Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        {getStatusIcon(form.status)}
                        {getStatusBadge(form.status)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{form.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="dir-ltr">{form.phone}</span>
                      </div>
                      {form.email && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4 text-purple-500" />
                          <span className="dir-ltr">{form.email}</span>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          تاریخ ارسال
                        </p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {formatDate(form.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-3 lg:col-span-2">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          پیام:
                        </p>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                            {form.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleMarkAsRead(form.id)}
                          disabled={form.status !== 'new'}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          {form.status === 'new'
                            ? 'علامت به عنوان خوانده شده'
                            : 'خوانده شده'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteContactForm(form.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
