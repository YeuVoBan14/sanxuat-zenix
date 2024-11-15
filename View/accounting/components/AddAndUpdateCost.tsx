'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPOCustomerList, postCost, putCost } from '@/api/accounting'
import { toast } from '@/components/ui/use-toast'
import Edit from '@/components/icons/Edit'
import { getSupplierList } from '@/api/supply'
import { getAllUser } from '@/api/user'
import { getPaymentCategory } from '@/api/payment'
import { getListPurchase } from '@/api/purchase'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'

const FormSchema = z.object({
  paymentDate: z.string({
    required_error: 'Vui lòng chọn ngày thanh toán'
  }),
  dateExportBill: z.string({
    required_error: 'Vui lòng chọn ngày xuất hóa đơn'
  }),
  paymentAmount: z.string({
    required_error: 'Vui lòng nhập số tiền thanh toán'
  }),
  noteCost: z
    .string({
      required_error: 'Vui lòng nhập ghi chú'
    })
    .min(5, {
      message: 'Nhập ít nhất 5 kí tự'
    })
    .max(160, {
      message: 'Chỉ có thể nhập 160 kí tự'
    }),
  title: z.string({
    required_error: 'Vui lòng nhập tiêu đề'
  }),
  PIC: z.number({
    required_error: 'Vui lòng chọn người phụ trách'
  }),
  codeBill: z.string({
    required_error: 'Vui lòng nhập số hóa đơn'
  }),
  paymentCategoryId: z.number({
    required_error: 'Vui lòng chọn danh mục thanh toán'
  }),
  file: z.any({
    required_error: 'Vui lòng chọn file'
  }),
  poCustomer: z.string({
    required_error: 'Vui lòng chọn số PO'
  })
})

export default function AddAndUpdateCost({ edit, costData }: { edit?: boolean; costData?: any }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState<any>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<{
    page: number
    pageSize: number
    keySearch: string
  }>({
    page: 0,
    pageSize: 9999999999,
    keySearch: ''
  })
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      paymentDate: edit && costData?.paymentDate,
      dateExportBill: edit && costData?.dateExportBill,
      paymentAmount: edit && costData?.paymentAmount,
      noteCost: edit && costData?.noteCost,
      title: edit && costData?.title,
      PIC: edit && costData?.PIC,
      codeBill: edit && costData?.codeBill,
      paymentCategoryId: edit && costData?.paymentCategoryId,
      poCustomer: edit && costData?.poCustomer,
      file: edit && costData?.fileCost
    }
  })

  const { data: supplierList } = useQuery({
    queryKey: ['supplierList', pagination],
    queryFn: () => getSupplierList(pagination)
  })

  const { data: userList } = useQuery({
    queryKey: ['allUser'],
    queryFn: () => getAllUser({ keySearch: '' })
  })

  const { data: poListData } = useQuery({
    queryKey: ['poList'],
    queryFn: getPOCustomerList
  })

  const { data: paymentCategoryList } = useQuery({
    queryKey: ['paymentCategoryList', pagination],
    queryFn: () => getPaymentCategory(pagination)
  })

  const { data: listPurchase } = useQuery({
    queryKey: ['listPurchase'],
    queryFn: () =>
      getListPurchase({
        page: 0,
        pageSize: 9999999999,
        keySearch: '',
        startDate: '',
        endDate: '',
        creator: [],
        customer: [],
        sale: [],
        supplier: []
      })
  })

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    }
  }

  const mutation = useMutation({
    mutationFn: (formData: FormData) => (edit ? putCost(costData?.id, formData) : postCost(formData)),
    onSuccess: () => {
      setIsLoading(false)
      queryClient.invalidateQueries({
        queryKey: ['costList']
      })
      setOpen(false)
      form.reset()
      toast({
        title: 'Thành công',
        description: `${edit ? 'Sửa' : 'Thêm mới'} chi phí thành công`
      })
    },
    onError: (error) => {
      setIsLoading(false)
      toast({
        title: 'Thất bại',
        description: error?.message
      })
    }
  })

  const onSubmit = (data: any) => {
    setIsLoading(true)
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (key != 'file') {
        formData.append(key, data[key])
      }
    })

    if (selectedFile) {
      formData.append('file', selectedFile)
    }

    mutation.mutateAsync(formData)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          {edit ? (
            <div>
              <Edit width='20' height='20' />
            </div>
          ) : (
            <Button>+ Thêm chi phí</Button>
          )}
        </DialogTrigger>
        <DialogContent className='sm:max-w-[950px] h-[650px] mx-auto overflow-y-auto scrollbar-thin'>
          <DialogHeader className='font-bold'>{edit ? 'Sửa' : 'Thêm mới'} chi phí</DialogHeader>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>* </span> Tiêu đề
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='Nhập tiêu đề' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='paymentAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>* </span> Số tiền thanh toán
                        </FormLabel>
                        <FormControl>
                          <Input type='number' min={0} placeholder='Nhập số tiền thanh toán' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4 items-center mt-2'>
                  <FormField
                    control={form.control}
                    name='paymentCategoryId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>* </span> Danh mục thanh toán
                        </FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={edit ? costData?.PaymentCategory?.name : 'Chọn danh mục thanh toán'}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentCategoryList?.data?.results?.map((item: any) => (
                              <SelectItem key={item?.id} value={item?.id?.toString()}>
                                {item?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='paymentDate'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel className='mb-1'>
                          <span className='text-red-500'>* </span> Ngày thanh toán
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'pl-3 text-left font-normal shadow-md',
                                  !field?.value && 'text-muted-foreground'
                                )}
                              >
                                {field?.value ? (
                                  !isNaN(new Date(field.value).getTime()) ? (
                                    format(new Date(field.value), 'dd/MM/yyyy')
                                  ) : (
                                    <span>Chọn ngày xuất hóa đơn</span>
                                  )
                                ) : (
                                  <span>Chọn ngày thanh toán</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={
                                field?.value
                                  ? typeof field?.value === 'string'
                                    ? new Date(field?.value)
                                    : field?.value
                                  : undefined
                              }
                              onSelect={(value) => field.onChange(String(value))}
                              disabled={(date) => {
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const compareDate = new Date(date)
                                compareDate.setHours(0, 0, 0, 0)

                                return compareDate < today || compareDate < new Date('1900-01-01')
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-2 gap-4 items-center'>
                  <FormField
                    control={form.control}
                    name='poCustomer'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>* </span> Số PO
                        </FormLabel>
                        <Select onValueChange={(value) => field.onChange(value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={edit ? costData?.poCustomer : 'Chọn số PO'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {poListData?.data?.map((item: any, index: number) => (
                              <SelectItem key={index} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='codeBill'
                    render={({ field }) => (
                      <FormItem className='my-3'>
                        <FormLabel>
                          <span className='text-red-500'>* </span> Số hóa đơn
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='Nhập số hóa đơn' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4 my-2'>
                  <div>
                    <FormField
                      control={form.control}
                      name='PIC'
                      render={({ field }) => (
                        <FormItem className='mb-3'>
                          <FormLabel>
                            <span className='text-red-500'>* </span> PIC
                          </FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={edit ? costData?.infoPIC?.fullName : 'Chọn người phụ trách'}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userList?.data?.map((item: any) => (
                                <SelectItem key={item?.id} value={item?.id?.toString()}>
                                  {item?.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='dateExportBill'
                      render={({ field }) => (
                        <FormItem className='flex flex-col'>
                          <FormLabel>
                            <span className='text-red-500'>* </span> Ngày xuất hóa đơn
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'pl-3 text-left font-normal shadow-md',
                                    !field?.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field?.value ? (
                                    !isNaN(new Date(field.value).getTime()) ? (
                                      format(new Date(field.value), 'dd/MM/yyyy')
                                    ) : (
                                      <span>Chọn ngày xuất hóa đơn</span>
                                    )
                                  ) : (
                                    <span>Chọn ngày xuất hóa đơn</span>
                                  )}
                                  <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start'>
                              <Calendar
                                mode='single'
                                selected={
                                  field?.value
                                    ? typeof field?.value === 'string'
                                      ? new Date(field?.value)
                                      : field?.value
                                    : undefined
                                }
                                onSelect={(value) => field.onChange(String(value))}
                                disabled={(date) => {
                                  const today = new Date()
                                  today.setHours(0, 0, 0, 0)
                                  const compareDate = new Date(date)
                                  compareDate.setHours(0, 0, 0, 0)

                                  return compareDate < today || compareDate < new Date('1900-01-01')
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name='noteCost'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>* </span> Ghi chú
                        </FormLabel>
                        <FormControl>
                          <Textarea className='shadow-md h-[198px]' placeholder='Nhập ghi chú' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='file'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex justify-between items-end mb-2 mt-2'>
                        <div>
                          <span className='text-red-500'>* </span>
                          Thông tin thêm
                        </div>
                        {edit && costData?.fileCost && (
                          <a href={`${costData?.fileCost}`} target='_blank'>
                            <Badge>Xem file</Badge>
                          </a>
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input type='file' onChange={onFileChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className='mt-8'>
                  <DialogClose>
                    <Button variant={'outline'} type='button'>
                      Hủy
                    </Button>
                  </DialogClose>
                  <Button type='submit' disabled={isLoading}>
                    {isLoading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
                    Xác nhận
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
