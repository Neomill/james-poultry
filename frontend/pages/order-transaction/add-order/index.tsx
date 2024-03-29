import ActionTableMenu from "@/components/ActionTableMenu";
import { Button } from "@/components/Button";
import Forbidden from "@/components/Forbidden";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import POSTableCard from "@/components/POSTableCard";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/redux/hooks";
import { useSearchTableQuery } from "@/redux/services/tablesAPI";
import { useSearchBranchQuery } from "@/redux/services/branchAPI";
import checkPermissions from "@/utils/checkPermissions";
import Link from "next/link";
import React, { ReactElement, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { BsArrowLeft, BsPlusCircle } from "react-icons/bs";

type Props = {};

const AddOrder = (props: Props) => {
  const { user } = useAuth();
  const methods = useForm();
  const { filters, sortBy } = useAppSelector((state) => state.filters);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');

  const { data, error, isLoading } = useSearchBranchQuery({
    page,
    query,
    ...filters,
    ...sortBy,
  });
  
  const onSubmitSearch = (data) => {
    setPage(0);
    setQuery(data.search);
  };

  if (!checkPermissions(["create-order"], user.roles)) {
    return <Forbidden />;
  }
  // if (error) return <p>Ooops. Something went wrong!</p>;
  // if (isLoading) return <Loading />;


// let removeCurrentbranch = data.body.filter(e => e.name != user.employee.branch.name)

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmitSearch)}>
          <ActionTableMenu
            title="Add New Order (Select Branch)"
            onSubmit={onSubmitSearch}
          ></ActionTableMenu>
        </form>
      </FormProvider>
      {data && (
        <div className="p-4 flex flex-col gap-6">
          <ul className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-6 ">
            {data.body.map((branch) => {
            return ( 
              <>
                <POSTableCard
                  isTaken={branch.invoices?.some(
                    (invoice) => invoice.payment_status === "PENDING"
                  )}
                  name={`${branch.name}`}
                  key={branch.id}
                  href={`/order-transaction/add-order/${branch.id}`}
                  branch_address = {branch.address} 
                />
              </>
            )})}
          </ul>
          <Pagination
            page={page}
            setPage={setPage}
            totalPages={data.totalPages}
          />
        </div>
      )}
    </>
  );
};

export default AddOrder;
AddOrder.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout icon={<BsPlusCircle />} title="Select Branch">
      {page}
    </Layout>
  );
};
