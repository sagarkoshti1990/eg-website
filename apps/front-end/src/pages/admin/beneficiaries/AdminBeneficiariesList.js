import React from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";

import {
  Box,
  HStack,
  VStack,
  ScrollView,
  Button,
  Input,
  Text,
} from "native-base";
import {
  IconByName,
  AdminLayout as Layout,
  useWindowSize,
  benificiaryRegistoryService,
  AdminTypo,
  geolocationRegistryService,
  facilitatorRegistryService,
  setQueryParameters,
  debounce,
  urlData,
} from "@shiksha/common-lib";
import Table from "./AdminBeneficiariesListTable";
import { MultiCheck } from "../../../component/BaseInput";
import { useTranslation } from "react-i18next";

function CustomFieldTemplate({ id, schema, label, required, children }) {
  const { t } = useTranslation();
  return (
    <VStack borderTopWidth="1" borderTopColor="dividerColor">
      {(!schema?.format || schema?.format !== "hidden") &&
        (label || schema?.label) && (
          <Box>
            {(id !== "root" || schema?.label) && (
              <HStack justifyContent="space-between" width="100%">
                <label
                  style={{
                    fontWeight: "bold",
                    color: "textGreyColor.400",
                    paddingBottom: "12px",
                  }}
                >
                  {t(label)}
                  {required ? "*" : null}
                </label>
                {/* <IconByName name="SearchLineIcon" _icon={{ size: "15px" }} /> */}
              </HStack>
            )}
          </Box>
        )}
      <Box>{children}</Box>
    </VStack>
  );
}

export default function AdminHome({ footerLinks }) {
  const [Width, Height] = useWindowSize();
  const [refAppBar, setRefAppBar] = React.useState();
  const ref = React.useRef(null);

  const [filter, setFilter] = React.useState({ limit: 10 });
  const [loading, setLoading] = React.useState(true);

  const [data, setData] = React.useState([]);
  const [paginationTotalRows, setPaginationTotalRows] = React.useState(0);

  React.useEffect(async () => {
    setLoading(true);
    const result = await benificiaryRegistoryService.beneficiariesFilter(
      filter
    );
    setData(result.data?.data);
    setPaginationTotalRows(
      result?.data?.totalCount ? result?.data?.totalCount : 0
    );
    setLoading(false);
  }, [filter]);

  React.useEffect(() => {
    setFilter({ ...filter, ...urlData(["district", "facilitator", "block"]) });
  }, []);

  return (
    <Layout getRefAppBar={(e) => setRefAppBar(e)} _sidebar={footerLinks}>
      <HStack>
        <Box
          flex={[2, 2, 1]}
          style={{ borderRightColor: "dividerColor", borderRightWidth: "2px" }}
        >
          <HStack ref={ref}></HStack>
          <ScrollView
            maxH={
              Height - (refAppBar?.clientHeight + ref?.current?.clientHeight)
            }
            pr="2"
          >
            <Filter {...{ filter, setFilter }} />
          </ScrollView>
        </Box>
        <Box flex={[5, 5, 4]}>
          <ScrollView
            maxH={Height - refAppBar?.clientHeight}
            minH={Height - refAppBar?.clientHeight}
          >
            <Box roundedBottom={"2xl"} py={6} px={4} mb={5}>
              <Table
                filter={filter}
                setFilter={(e) => {
                  setFilter(e);
                  setQueryParameters(e);
                }}
                paginationTotalRows={paginationTotalRows}
                data={data}
                loading={loading}
              />
            </Box>
          </ScrollView>
        </Box>
      </HStack>
    </Layout>
  );
}

export const Filter = ({ filter, setFilter }) => {
  const { t } = useTranslation();
  const [facilitator, setFacilitator] = React.useState([]);
  const [getDistrictsAll, setgetDistrictsAll] = React.useState();
  const [getBlocksAll, setGetBlocksAll] = React.useState();
  const [facilitatorFilter, setFacilitatorFilter] = React.useState({});

  // facilitator pagination
  const [isMore, setIsMore] = React.useState("");

  const setFilterObject = (data) => {
    if (data?.district) {
      const { district } = data;
      setFacilitatorFilter({ ...facilitatorFilter, district });
    }
    setFilter(data);
    setQueryParameters(data);
  };

  const schema = {
    type: "object",
    properties: {
      district: {
        type: "array",
        title: "DISTRICT",
        grid: 1,
        _hstack: {
          maxH: 130,
          overflowY: "scroll",
        },
        items: {
          type: "string",
          enumNames: getDistrictsAll?.map((item, i) => item?.district_name),
          enum: getDistrictsAll?.map((item, i) => item?.district_name),
        },
        uniqueItems: true,
      },
      block: {
        type: "array",
        title: "BLOCKS",
        grid: 1,
        _hstack: {
          maxH: 130,
          overflowY: "scroll",
        },
        items: {
          type: "string",
          enumNames: getBlocksAll?.map((item, i) => item?.block_name),
          enum: getBlocksAll?.map((item, i) => item?.block_name),
        },
        uniqueItems: true,
      },
    },
  };

  const uiSchema = {
    district: {
      "ui:widget": MultiCheck,
      "ui:options": {},
    },
    block: {
      "ui:widget": MultiCheck,
      "ui:options": {},
    },
  };

  React.useEffect(async () => {
    let name = "RAJASTHAN";
    const getDistricts = await geolocationRegistryService.getDistricts({
      name,
    });
    setgetDistrictsAll(getDistricts?.districts);
  }, []);

  React.useEffect(async () => {
    let blockData = [];
    if (filter?.district?.length > 0) {
      blockData = await geolocationRegistryService.getMultipleBlocks({
        districts: filter?.district,
      });
    }
    if (Array.isArray(blockData)) {
      setGetBlocksAll(blockData);
    }
  }, [filter?.district]);

  React.useEffect(() => {
    const facilitatorDetails = async () => {
      const result = await facilitatorRegistryService.filter(facilitatorFilter);
      setIsMore(
        parseInt(`${result?.data?.currentPage}`) <
          parseInt(`${result?.data?.totalPages}`)
      );
      const newData = result?.data?.data?.map((e) => ({
        value: e?.id,
        label: `${e?.first_name} ${e?.last_name ? e?.last_name : ""}`,
      }));
      const newFilterData = newData.filter(
        (e) =>
          facilitator.filter((subE) => subE.value === e?.value).length === 0
      );
      if (filter?.page > 1) {
        setFacilitator([...facilitator, ...newFilterData]);
      } else {
        setFacilitator(newFilterData);
      }
    };
    facilitatorDetails();
  }, [facilitatorFilter]);

  const onChange = async (data) => {
    const { district, block } = data?.formData || {};
    setFilterObject({
      ...filter,
      ...(district ? { district } : {}),
      ...(block ? { block } : {}),
    });
  };

  const clearFilter = () => {
    setFilter({});
    setFilterObject({});
  };

  return (
    <VStack space={8} py="5">
      <VStack space={3}>
        <HStack alignItems="center" justifyContent="space-between">
          <HStack>
            <IconByName isDisabled name="FilterLineIcon" />
            <AdminTypo.H5 bold>{t("FILTERS")}</AdminTypo.H5>
          </HStack>
          <Button variant="link" pt="3" onPress={clearFilter}>
            <AdminTypo.H6 color="blueText.400" underline bold>
              {t("CLEAR_FILTER")}
            </AdminTypo.H6>
          </Button>
        </HStack>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onChange={onChange}
          validator={validator}
          formData={filter}
          templates={{
            FieldTemplate: CustomFieldTemplate,
          }}
        >
          <Button display={"none"} type="submit"></Button>
        </Form>
        <Text bold>{t("PRERAK")}</Text>
        <Input
          w="100%"
          height="32px"
          placeholder="search"
          variant="outline"
          onChange={(e) => {
            debounce(
              setFacilitatorFilter({
                ...facilitatorFilter,
                search: e.nativeEvent.text,
                page: 1,
              }),
              3000
            );
          }}
        />
        <MultiCheck
          value={filter?.facilitator ? filter?.facilitator : []}
          onChange={(e) => {
            setFilterObject({ ...filter, facilitator: e });
          }}
          schema={{
            grid: 1,
            _hstack: {
              maxH: 130,
              overflowY: "scroll",
            },
          }}
          options={{
            enumOptions: facilitator,
          }}
        />
        {isMore && (
          <Button
            onPress={(e) =>
              setFacilitatorFilter({
                ...facilitatorFilter,
                page:
                  (facilitatorFilter?.page
                    ? parseInt(facilitatorFilter?.page)
                    : 1) + 1,
              })
            }
            pr="2"
          >
            {t("MORE")}
          </Button>
        )}
      </VStack>
    </VStack>
  );
};