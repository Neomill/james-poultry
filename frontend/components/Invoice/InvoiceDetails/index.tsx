import { Button } from "@/components/Button";
import Input from "@/components/Input";
import POSReceiptCard from "@/components/POSReceiptCard";
import { useGetInvoiceByIdQuery } from "@/redux/services/invoicesAPI";
import { useGetCustomerByIdQuery } from "@/redux/services/customersAPI";
import { useCreateTransactionMutation } from "@/redux/services/transactionsAPI";
import { numberWithCommas } from "@/utils/numberWithCommas";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  id: string;
  onClose: () => void;
};

export enum InvoiceStatus {
  REQUESTING_TO_OTHER_BRANCH = "REQUESTING_TO_OTHER_BRANCH",
  IN_PROGRESS = "IN_PROGRESS",
  READY = "READY",
  VOID = "VOID",
}
export enum InvoicePaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}
export interface InvoiceProps {
  id: string;
  orders: any[];
  createdAt: string;
  updatedAt: string;
  status: InvoiceStatus;
  customer_id: string | number;
  customer: any;
  payment_status: InvoicePaymentStatus;
  table_id: string | number;
  table: any;
  transaction: any;
  request_to_branch: string;
  request_to_branch_NAME: string;
  link_invoice: string | number;
}

const InvoiceSchema = yup
  .object({
    cash: yup.number().positive().required(),
  })
  .required();

const InvoiceDetails = ({ id, onClose }: Props) => {
  const { user } = useAuth();
  const { data, isLoading } = useGetInvoiceByIdQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const methods = useForm({
    resolver: yupResolver(InvoiceSchema),
  });
  const { watch } = methods;
  const watchCash = watch("cash", false);

  const [createTransaction] = useCreateTransactionMutation();
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log()
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (data) {
      const sum = data.orders.reduce(
        (partialSum, order) =>
          partialSum + Number(order.price) * Number(order.qty),
        0
      );
      setTotalPrice(sum);
    }
  }, [data, isLoading]);

  const router = useRouter();

  const handlePayment = async (formVal: any) => {
    let isAvailabeCustomer = data.request_to_branch
    if(data.request_to_branch_NAME == 'customer'){
      isAvailabeCustomer = formVal.customer_name
    }

    let isAvailabelname = "N/A"
    if(formVal.customer_lname){
      isAvailabelname = formVal.customer_lname
    }

    let isAvailabePhone = "N/A"
    if(formVal.customer_phone){
      isAvailabePhone = formVal.customer_phone
    }
    
    let isAvailabelAddress = "N/A"
    if(formVal.customer_address){
      isAvailabelAddress = formVal.customer_address
    }
    
    let isAvailabelMname = "N/A"
    if(formVal.customer_customer_mname){
      isAvailabelMname = formVal.customer_mname
    }
    
    await toast.promise(
      createTransaction({
        invoice_id: id,
        transaction_code: "JMH_"+ Date.now() + id,
        customer_id: formVal.customer_id,
        customer_name : isAvailabeCustomer,
        customer_lname : isAvailabelname,
        customer_phone : isAvailabePhone,
        customer_address: isAvailabelAddress,
        customer_mname: isAvailabelMname,
        branch_id: user.employee.branch.id,
        cash: formVal.cash,
      }).unwrap(),
      {
        error: "Insufficient Funds/Out of Stock",
        pending: "Transaction In Progress...",
        success: "Transaction Complete.",
      }
    );
    onClose();
  };
  if (isLoading) {
    return <div>Loading</div>;
  }
  if (!data) {
    return <div>Wow! Such empty.</div>;
  }

  console.log(data)

  return (
    <div className="h-full bg-white border rounded-lg   overflow-hidden  sm:grid-cols-3 lg:grid-cols-4 gap-4  w-96 max-w-lg mx-auto">
      <div className="px-4 py-5 sm:px-6">
        {(data?.link_invoice != 0) && (<p className="uppercase font-bold">{data?.request_to_branch_NAME}</p>)}
      </div>
      <div className="h-full  text-xs border-t border-gray-300 flex-col ">
        <dl style={{ height: "450px" }} className=" overflow-y-auto">
          {data?.orders?.map((order, idx) => {
            let mod_order = { ...order, name: order.menu_item?.name };
            if (idx % 2 == 0) {
              return (
                <POSReceiptCard
                  order={mod_order}
                  key={order.menu_item_id}
                  isDark
                />
              );
            } else {
              return (
                <POSReceiptCard order={mod_order} key={order.menu_item_id} />
              );
            }
          })}
        </dl>
        <div className="mt-6">
          <div className="bg-white px-4 sm:gap-4 sm:px-6 flex justify-between">
            <span className=" mb-2  font-bold">Total</span>
            <span className="mb-2 font-bold">
              ₱{numberWithCommas(Number(totalPrice).toFixed(2))}
            </span>
          </div>
          {data.transaction?.cash && (
            <div className="bg-white px-4 sm:gap-4 sm:px-6 flex justify-between">
              <span className=" mb-2  font-bold">Cash Tendered</span>
              <span className="mb-2 font-bold">
                ₱{numberWithCommas(Number(data.transaction?.cash).toFixed(2))}
              </span>
            </div>
          )}
          <div className="border-t text-gray-400 bg-white px-4 pt-2 pb-4 sm:gap-4 sm:px-6 flex justify-between">
            <span className=" mb-2  font-bold">Change</span>
            <span className="mb-2 font-bold">
              ₱
              {data.transaction?.change
                ? numberWithCommas(data.transaction?.change)
                : Number(methods.getValues("cash")) - Number(totalPrice) > 0
                ? numberWithCommas(
                    Number(
                      Number(methods.getValues("cash")) - Number(totalPrice)
                    ).toFixed(2)
                  )
                : 0}
            </span>
          </div>

          {data.payment_status === "PENDING" && (
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handlePayment)}>
                <div className="sm:grid px-5 pb-4 gap-4">
                  { (data.request_to_branch_NAME == "customer") &&              
                 ( <Input
                    name="customer_name"
                    label="Customer name"
                    placeholder="Customer Name"
                  />)}

                  { (data.request_to_branch_NAME == "customer") &&  
                  (
                  <Input
                    name="customer_lname"
                    label="Customer Surname"
                    placeholder="(optional)"
                  />
                  )}

                  { (data.request_to_branch_NAME == "customer") &&  
                  (
                  <Input
                    name="customer_address"
                    label="Customer Address"
                    placeholder="(optional)"
                  />
                  )}
                  { (data.request_to_branch_NAME == "customer") &&  
                  (
                  <Input
                    name="customer_phone"
                    label="Customer Phone #"
                    placeholder="(optional)"
                  />
                  )}
                  <Input
                    name="cash"
                    isDecimal
                    min={0}
                    label="Cash Tendered"
                    placeholder="Cash Tendered"
                    type="number"
                    step="any"
                  />
                  <Button
                    type="submit"
                    className="text-xs"
                    size="medium"
                    label={`Pay`}
                  />
                </div>
              </form>
            </FormProvider>
          )}
          {data.payment_status === "PAID" && (data.customer) && (data.request_to_branch == "") && ( 
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handlePayment)}>
                <div className="sm:grid px-5 pb-4 gap-4">
                { (data.customer.fname) &&              
                 ( <Input
                    name="customer_name"
                    label="Customer Name"
                    placeholder={`${data.customer.fname} ${data.customer.lname}`}
                    disabled
                  />)}
                { (data.customer.phone) &&              
                 ( <Input
                    name="customer_phone"
                    label="Customer Phone #"
                    placeholder={`${data.customer.fname} ${data.customer.lname}`}
                    disabled
                  />)}
                { (data.customer.address) &&              
                 ( <Input
                    name="customer_name"
                    label="Customer Adress"
                    placeholder={data.customer.address}
                    disabled
                  />)}
                </div>
              </form>
            </FormProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
