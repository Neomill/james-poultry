import ActionTableMenu from "@/components/ActionTableMenu";
import { Button } from "@/components/Button";
import Forbidden from "@/components/Forbidden";
import Layout from "@/components/Layout";
import Pagination from "@/components/Pagination";
import POSFoodCard from "@/components/POSFoodCard";
import POSReceipt from "@/components/POSReceipt";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/redux/hooks";
import { useSearchMenuItemsQuery } from "@/redux/services/menuItemsAPI";
import checkPermissions from "@/utils/checkPermissions";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { BsArrowLeft, BsPlusCircle } from "react-icons/bs";

type Props = {};

const StepThreeSelectFood = (props: Props) => {
  const { user } = useAuth();
  const methods = useForm();
  const { filters, sortBy } = useAppSelector((state) => state.filters);

  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data, error, isLoading } = useSearchMenuItemsQuery({
    page,
    query,
    ...{
      menu_item_category: router.query.category,
    },
    ...sortBy,
  });

  useEffect(() => {
    if (data?.totalPages < 0) {
      setPage(0);
    } else if (page > data?.totalPages) {
      setPage(data.totalPages);
    }

    return () => {};
  }, [filters, data]);
  const onSubmitSearch = (data) => {
    setPage(0);
    setQuery(data.search);
  };

  if (!checkPermissions(["create-order"], user.roles)) {
    return <Forbidden />;
  }
  // if (error) return <p>Ooops. Something went wrong!</p>;
  // if (isLoading) return <Loading />;
  return (
    <div className="flex gap-4 ">
      <div className="w-full">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmitSearch)}>
            <ActionTableMenu
              title={
                <Link href={`/order-transaction/add-order/${router.query.table}`} passHref>
                  <a>
                    <Button
                      icon={<BsArrowLeft />}
                      outline
                      size="medium"
                      label="Go Back"
                    />
                  </a>
                </Link>
              }
              onSubmit={onSubmitSearch}
            ></ActionTableMenu>
          </form>
        </FormProvider>
        {data && (
          <div className="p-4 flex flex-col gap-6">
            <ul className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-6 ">
              {data.body.map((menuItem) => (
                <>
                  <POSFoodCard
                    name={menuItem.name}
                    key={menuItem.id}
                    id={menuItem.id}
                    desc={menuItem.desc}
                    image_url={menuItem.image_url}
                    price={menuItem.selling_price}
                    href={`/order-transaction/add-order/${router.query.table}/${router.query.category}/${menuItem.id}`}
                  />
                </>
              ))}
            </ul>
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={data.totalPages}
            />
          </div>
        )}
      </div>
      <div style={{ width: "500px" }} className=" min-h-full ">
        <POSReceipt />
      </div>
    </div>
  );
};

export default StepThreeSelectFood;
StepThreeSelectFood.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout icon={<BsPlusCircle />} title="Select Menu">
      {page}
    </Layout>
  );
};
