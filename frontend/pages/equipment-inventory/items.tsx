import ActionButton from "@/components/ActionButton";
import ActionTableMenu from "@/components/ActionTableMenu";
import BulkOperations from "@/components/BulkOperations";
import { Button } from "@/components/Button";
import Forbidden from "@/components/Forbidden";
import Layout from "@/components/Layout";
import Loading from "@/components/Loading";
import EquipmentItemModalManager from "@/components/EquipmentItems/EquipmentItemModalManager";
import Pagination from "@/components/Pagination";
import StyledTable from "@/components/StyledTable";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/redux/hooks";
import {
  useDeleteEquipmentItemMutation,
  useSearchEquipmentItemsQuery,
} from "@/redux/services/equipmentItemsAPI";
import checkPermissions from "@/utils/checkPermissions";
import { numberWithCommas } from "@/utils/numberWithCommas";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { BsCardList, BsPlusCircle } from "react-icons/bs";
import { toast } from "react-toastify";
const EquipmentItem = () => {
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<string>("");
  const [selectedId, setSelectedId] = useState("");
  const { filters, sortBy } = useAppSelector((state) => state.filters);
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const { data, error, isLoading } = useSearchEquipmentItemsQuery({
    page,
    query,
    ...filters,
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

  const methods = useForm();
  const onSubmitSearch = (data) => {
    setPage(0);
    setQuery(data.search);
  };
  //---
  const onModalOpen = (event, id?) => {
    event.preventDefault();
    const modal = event.currentTarget.getAttribute("data-modal");

    if (id) {
      setSelectedId(id);
    }
    if (modal) setModal(modal);
  };
  const onModalClose = () => {
    setModal("");
  };
  const [deletMenuItem] = useDeleteEquipmentItemMutation();
  const [selectedItems, setSelectedItems] = useState([]);

  const onConfirmDelete = async () => {
    toast.promise(deletMenuItem(selectedId).unwrap(), {
      pending: "Deleting Equipment...",
      error: "Error deleting equipment!",
      success: "Equipment deleted successfully!",
    });
    setSelectedId("");
    onModalClose();
  };

  const sortOptions = useMemo(
    () => [
      {
        title: "Sort By",
        selector: "sortBy",
        selectedOption: { selector: "createdAt", value: 1 },
        sub_options: [
          {
            title: "ID #: Asc - Desc",
            value: { selector: "id", value: 0 },
          },
          {
            title: "ID #: Desc - Asc",
            value: { selector: "id", value: 1 },
          },
          {
            title: "Name: A-Z",
            value: { selector: "name", value: 0 },
          },
          {
            title: "Name: Z-A",
            value: { selector: "name", value: 1 },
          },
          {
            title: "Quantity: Low to High",
            value: { selector: "qty", value: 0 },
          },
          {
            title: "Quantity: High to Low",
            value: { selector: "qty", value: 1 },
          },
          {
            title: "Cost Price: Low to High",
            value: { selector: "price", value: 0 },
          },
          {
            title: "Cost Price: High to Low",
            value: { selector: "price", value: 1 },
          },
          {
            title: "Last Created",
            value: { selector: "createdAt", value: 1 },
          },
          {
            title: "Last Updated",
            value: { selector: "updatedAt", value: 1 },
          },
        ],
      },
    ],
    []
  );

  const columns = useMemo<any>(
    () => [
      {
        Header: "#",
        accessor: "id",
      },
      // {
      //   Header: "Image",
      //   accessor: "image_url",
      //   Cell: (props: any) => (
      //     <img
      //       className="rounded-lg w-20 h-20 object-cover"
      //       src={props.value ? props.value : "/shydan.jpg"}
      //       alt="No Image Available"
      //     />
      //   ),
      // },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Category",
        accessor: "equipment_category.name",
        Cell: (props: any) => <div>{props.value}</div>,
      },
      {
        Header: "Qty",
        accessor: "qty",
      },
      {
        Header: "Cost Price",
        accessor: "cost_price",
        Cell: (props: any) => (
          <div>
            &#8369;
            {numberWithCommas(props.value)}
          </div>
        ),
      },
      {
        Header: "Selling Price",
        accessor: "selling_price",
        Cell: (props: any) => (
          <div>
            &#8369;
            {numberWithCommas(props.value)}
          </div>
        ),
      },
      {
        Header: "Remark",
        accessor: "remark",
      },
      {
        Header: "Actions",
        Cell: (props: any) => (
          <div className="flex items-center flex-row gap-4 min-w-fit">
            {/* {checkPermissions(["update-menu-item"], user.roles) && (
              <ActionButton
                data-modal="restock-menu-item-modal"
                onClick={(e) => onModalOpen(e, props.row.original.id)}
                action="add"
              />
            )} */}
            <ActionButton
              data-modal="view-equipment-item-modal"
              onClick={(e) => onModalOpen(e, props.row.original.id)}
              action="view"
            />
            {checkPermissions(["update-equipment-item"], user.roles) && (
              <ActionButton
                data-modal="edit-equipment-item-modal"
                onClick={(e) => onModalOpen(e, props.row.original.id)}
                action="edit"
              />
            )}
            {checkPermissions(["delete-equipment-item"], user.roles) && (
              <ActionButton
                data-modal="delete-equipment-item-modal"
                onClick={(e) => onModalOpen(e, props.row.original.id)}
                action="delete"
              />
            )}
          </div>
        ),
      },
    ],
    []
  );
  if (!checkPermissions(["read-equipment-item"], user.roles)) {
    console.log(user.roles)
    return <Forbidden />;
  }
  if (error){
    return <p>Ooops. Something went wrong!</p>;
  }
  if (isLoading) return <Loading />;
  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmitSearch)}>
          <ActionTableMenu
            sortOptions={sortOptions}
            title="Equipment Inventory"
            onSubmit={onSubmitSearch}
            operations={
              <BulkOperations
                bulkDelete={selectedItems.length > 0}
                model="equipment-item"
                onModalOpen={onModalOpen}
                page={page}
                totalPages={data.totalPages}
              />
            }
          >
            {checkPermissions(["create-equipment-item"], user.roles) && (
              <>
                <Button
                  onClick={() => router.push("/equipment-inventory/bulk-add")}
                  icon={<BsPlusCircle />}
                  size="medium"
                  label="Add Equipment"
                />
              </>
            )}
          </ActionTableMenu>
        </form>
      </FormProvider>
      {data ? (
        <>
          <StyledTable
            setSelectedItems={setSelectedItems}
            columns={columns}
            data={data.body}
          >
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={data.totalPages}
            />
          </StyledTable>
        </>
      ) : (
        "No data available."
      )}

      <EquipmentItemModalManager
        closeFn={onModalClose}
        selectedItems={selectedItems}
        onConfirmDelete={onConfirmDelete}
        selectedId={selectedId}
        modal={modal}
      ></EquipmentItemModalManager>
    </>
  );
};

export default EquipmentItem;

EquipmentItem.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout icon={<BsCardList />} title="Equipment Items">
      {page}
    </Layout>
  );
};
