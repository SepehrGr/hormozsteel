'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Phone,
  User,
  Building2,
  MapPin,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Send,
  MessageSquare,
  Info,
  FileText,
  Weight,
} from 'lucide-react';
import moment from 'moment-jalaali';

interface OrderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productSpecs?: string;
}

interface OrderFormData {
  customerName: string;
  companyName: string;
  phoneNumber: string;
  city: string;
  productSpecs: string;
  quantity: string;
  deliveryDate: string;
  deliveryMethod: 'pickup' | 'delivery';
  additionalNotes: string;
}

export default function OrderRequestModal({
  isOpen,
  onClose,
  productName = '',
  productSpecs = '',
}: OrderRequestModalProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    companyName: '',
    phoneNumber: '',
    city: '',
    productSpecs: productSpecs,
    quantity: '',
    deliveryDate: '',
    deliveryMethod: 'pickup',
    additionalNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.customerName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.city.trim() ||
      !formData.productSpecs.trim() ||
      !formData.quantity.trim()
    ) {
      alert('لطفاً تمام فیلدهای ضروری را پر کنید.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quick-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          companyName: formData.companyName,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
          productSpecs: formData.productSpecs,
          quantity: formData.quantity,
          deliveryDate: formData.deliveryDate || null,
          deliveryMethod: formData.deliveryMethod,
          additionalNotes: formData.additionalNotes,
          productName: productName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            customerName: '',
            companyName: '',
            phoneNumber: '',
            city: '',
            productSpecs: productSpecs,
            quantity: '',
            deliveryDate: '',
            deliveryMethod: 'pickup',
            additionalNotes: '',
          });
          onClose();
        }, 3000);
      } else {
        alert(data.error || 'خطا در ثبت سفارش');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
      setIsSubmitting(false);
    }
  };

  // Jalali date picker state
  const [showCalendar, setShowCalendar] = useState(false);
  const [displayJYear, setDisplayJYear] = useState<number>(() =>
    formData.deliveryDate
      ? moment(formData.deliveryDate).jYear()
      : moment().jYear()
  );
  const [displayJMonth, setDisplayJMonth] = useState<number>(() =>
    formData.deliveryDate
      ? moment(formData.deliveryDate).jMonth()
      : moment().jMonth()
  );

  // Ensure calendar is closed and month/year are initialized when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowCalendar(false);
      setDisplayJYear(
        formData.deliveryDate
          ? moment(formData.deliveryDate).jYear()
          : moment().jYear()
      );
      setDisplayJMonth(
        formData.deliveryDate
          ? moment(formData.deliveryDate).jMonth()
          : moment().jMonth()
      );
    }
  }, [isOpen]);

  const persianMonths = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];
  const jalaliMonthName = (m: number) => persianMonths[m] || '';

  const startOfJMonth = (jy: number, jm: number) =>
    moment().jYear(jy).jMonth(jm).jDate(1);
  const daysInJMonth = (jy: number, jm: number) => {
    // moment-jalaali exposes jDaysInMonth; use any to satisfy TS types
    return (moment as any).jDaysInMonth(jy, jm);
  };

  const selectJalaliDay = (day: number) => {
    const m = moment().jYear(displayJYear).jMonth(displayJMonth).jDate(day);
    // convert to ISO (gregorian) string
    const iso = m.toDate().toISOString();
    handleInputChange('deliveryDate', iso);
    setShowCalendar(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-white shadow-2xl animate-slide-in-from-bottom">
        <CardHeader className="sticky top-0 z-10 py-3 ">
          <button
            onClick={onClose}
            className="absolute p-1 transition-colors rounded-full left-3 top-3 hover:bg-white/50 group"
            aria-label="بستن"
          >
            <X className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
          </button>

          <div className="pt-1 text-center"></div>
        </CardHeader>

        <CardContent
          className="p-4 overflow-y-auto"
          style={{ maxHeight: 'calc(80vh - 80px)' }}
        >
          {isSubmitted ? (
            <div className="py-6 space-y-3 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">
                درخواست شما ثبت شد
              </h3>
              <p className="text-sm text-gray-600">
                درخواست شما با موفقیت ثبت شد. کارشناسان ما در اسرع وقت با شما
                تماس خواهند گرفت.
              </p>
              <div className="inline-block px-3 py-2 rounded-md bg-blue-50">
                <p className="text-sm font-medium text-blue-800">
                  شماره پیگیری: #
                  {Math.random().toString(36).substr(2, 6).toUpperCase()}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* اطلاعات مشتری */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-800">
                    اطلاعات مشتری
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="customerName"
                      className="text-sm text-gray-700"
                    >
                      نام و نام خانوادگی *
                    </Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={formData.customerName}
                      onChange={(e) =>
                        handleInputChange('customerName', e.target.value)
                      }
                      className="w-full py-2"
                      placeholder="نام کامل"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm text-gray-700"
                    >
                      شماره تماس *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange('phoneNumber', e.target.value)
                      }
                      className="w-full py-2"
                      placeholder="09xxxxxxxxx"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="companyName"
                      className="text-sm text-gray-700"
                    >
                      نام شرکت
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange('companyName', e.target.value)
                      }
                      className="w-full py-2"
                      placeholder="اختیاری"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-sm text-gray-700">
                      شهر *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange('city', e.target.value)
                      }
                      className="w-full py-2"
                      placeholder="شهر"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* مشخصات محصول */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-800">
                    مشخصات سفارش
                  </h3>
                </div>

                <div>
                  <Label
                    htmlFor="productSpecs"
                    className="text-sm text-gray-700"
                  >
                    مشخصات محصول *
                  </Label>
                  <Input
                    id="productSpecs"
                    type="text"
                    value={formData.productSpecs}
                    onChange={(e) =>
                      handleInputChange('productSpecs', e.target.value)
                    }
                    className="w-full py-2"
                    placeholder="مثال: میلگرد آجدار A3 قطر 12 میلی‌متر"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor="quantity" className="text-sm text-gray-700">
                      مقدار مورد نیاز *
                    </Label>
                    <Input
                      id="quantity"
                      type="text"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange('quantity', e.target.value)
                      }
                      className="w-full py-2"
                      placeholder="مثال: 5 تن"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Label
                      htmlFor="deliveryDate"
                      className="text-sm text-gray-700"
                    >
                      تاریخ تحویل
                    </Label>

                    <button
                      type="button"
                      onClick={() => setShowCalendar((s) => !s)}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-left text-gray-700 border border-gray-200 rounded-md bg-gray-50"
                    >
                      <span>
                        {formData.deliveryDate
                          ? moment(formData.deliveryDate).format(
                              'jYYYY/jMM/jDD'
                            )
                          : 'تعیین نشده'}
                      </span>
                      <span className="text-xs text-gray-400">🔽</span>
                    </button>

                    {showCalendar && (
                      <div className="absolute left-0 z-20 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                        <div className="flex items-center justify-between px-3 py-2 border-b">
                          <button
                            type="button"
                            onClick={() => {
                              // prev month
                              if (displayJMonth === 0) {
                                setDisplayJMonth(11);
                                setDisplayJYear((y) => y - 1);
                              } else {
                                setDisplayJMonth((m) => m - 1);
                              }
                            }}
                            className="px-2 py-1 text-sm"
                          >
                            ‹
                          </button>
                          <div className="text-sm font-medium">
                            {jalaliMonthName(displayJMonth)} {displayJYear}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              // next month
                              if (displayJMonth === 11) {
                                setDisplayJMonth(0);
                                setDisplayJYear((y) => y + 1);
                              } else {
                                setDisplayJMonth((m) => m + 1);
                              }
                            }}
                            className="px-2 py-1 text-sm"
                          >
                            ›
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 p-2 text-xs text-center">
                          {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((d) => (
                            <div key={d} className="text-gray-500">
                              {d}
                            </div>
                          ))}

                          {/* blank leading cells if month doesn't start on first weekday */}
                          {(() => {
                            const start = startOfJMonth(
                              displayJYear,
                              displayJMonth
                            ).day();
                            const blanks = (start + 6) % 7; // convert to jalali week starting index (sat?) adjust
                            const days = [];
                            for (let i = 0; i < blanks; i++)
                              days.push(<div key={`b${i}`} />);
                            const dim = daysInJMonth(
                              displayJYear,
                              displayJMonth
                            );
                            for (let d = 1; d <= dim; d++) {
                              days.push(
                                <button
                                  key={`d${d}`}
                                  type="button"
                                  onClick={() => selectJalaliDay(d)}
                                  className="p-2 text-sm rounded hover:bg-blue-50"
                                >
                                  {d}
                                </button>
                              );
                            }
                            return days;
                          })()}
                        </div>
                      </div>
                    )}

                    {/* hidden ISO input kept for form semantics if needed */}
                    <input
                      type="hidden"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                    />
                  </div>
                </div>
              </div>

              {/* نحوه تحویل */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">نحوه تحویل</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={formData.deliveryMethod === 'pickup'}
                      onChange={(e) =>
                        handleInputChange('deliveryMethod', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        تحویل در محل کارخانه
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={formData.deliveryMethod === 'delivery'}
                      onChange={(e) =>
                        handleInputChange('deliveryMethod', e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        ارسال با باربری
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* توضیحات اضافی */}
              <div className="space-y-2">
                <Label
                  htmlFor="additionalNotes"
                  className="text-sm font-medium text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    توضیحات اضافی
                  </div>
                </Label>
                <textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange('additionalNotes', e.target.value)
                  }
                  className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="توضیحات اضافی در مورد سفارش خود (اختیاری)"
                />
              </div>

              {/* دکمه‌های عملیات */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      در حال ثبت...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      ثبت درخواست سفارش
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
