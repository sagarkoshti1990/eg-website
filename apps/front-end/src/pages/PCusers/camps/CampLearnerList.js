import {
  facilitatorRegistryService,
  t,
  IconByName,
  PCusers_layout as Layout,
  benificiaryRegistoryService,
  FrontEndTypo,
  SelectStyle,
  Loading,
  CardComponent,
  campService,
  AdminTypo,
} from "@shiksha/common-lib";
import { HStack, VStack, Box, Select, Pressable } from "native-base";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Chip, { ChipStatus } from "component/BeneficiaryStatus";
import InfiniteScroll from "react-infinite-scroll-component";
import Clipboard from "component/Clipboard";
import PropTypes from "prop-types";

const List = ({ data }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [learnerDetail, setLearnerDetail] = React.useState();
  const [loadingList, setLoadingList] = useState(false);
  const { id } = useParams();

  return (
    <VStack space="4" p="4" alignContent="center">
      <AdminTypo.H3
        color="textGreyColor.800"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        m="4"
      >
        {t("CAMP")}&nbsp;
        {id}
      </AdminTypo.H3>
      {(data && data?.length > 0) || data?.constructor?.name === "Array" ? (
        data &&
        data?.constructor?.name === "Array" &&
        data?.map((item) => (
          <CardComponent
            key={item?.id}
            _body={{ px: "3", py: "3" }}
            _vstack={{ p: 0, space: 0, flex: 1 }}
          >
            <Pressable
              onPress={async () => {
                // navigate(`/beneficiary/${item?.id}`);
              }}
              flex={1}
            >
              <HStack justifyContent="space-between" space={1}>
                <HStack alignItems="Center" flex={[1, 2, 4]}>
                  <VStack alignItems="center" p="1">
                    <Chip>
                      <Clipboard text={item?.id}>
                        <FrontEndTypo.H2 bold>{item?.id}</FrontEndTypo.H2>
                      </Clipboard>
                    </Chip>
                  </VStack>
                  <VStack
                    pl="2"
                    flex="1"
                    wordWrap="break-word"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {[
                      "enrolled_ip_verified",
                      "registered_in_camp",
                      "ineligible_for_pragati_camp",
                      "10th_passed",
                      "pragati_syc",
                    ].includes(item?.program_beneficiaries[0]?.status) ? (
                      <FrontEndTypo.H3 bold color="textGreyColor.800">
                        {item?.program_beneficiaries[0]?.enrollment_first_name}
                        {item?.program_beneficiaries[0]
                          ?.enrollment_middle_name &&
                          item?.program_beneficiaries[0]
                            ?.enrollment_middle_name !== "null" &&
                          ` ${item?.program_beneficiaries[0]?.enrollment_middle_name}`}
                        {item?.program_beneficiaries[0]?.enrollment_last_name &&
                          item?.program_beneficiaries[0]
                            ?.enrollment_last_name !== "null" &&
                          ` ${item?.program_beneficiaries[0]?.enrollment_last_name}`}
                      </FrontEndTypo.H3>
                    ) : (
                      <FrontEndTypo.H3 bold color="textGreyColor.800">
                        {item?.program_beneficiaries[0]?.first_name}
                        {item?.program_beneficiaries[0]
                          ?.enrollment_middle_name &&
                          item?.program_beneficiaries[0]
                            ?.enrollment_middle_name !== "null" &&
                          ` ${item.program_beneficiaries[0]?.enrollment_middle_name}`}
                        {item?.program_beneficiaries[0]?.enrollment_last_name &&
                          item?.program_beneficiaries[0]
                            ?.enrollment_last_name !== "null" &&
                          ` ${item.program_beneficiaries[0]?.enrollment_last_name}`}
                      </FrontEndTypo.H3>
                    )}

                    <FrontEndTypo.H5 color="textGreyColor.800">
                      {item?.mobile}
                    </FrontEndTypo.H5>
                  </VStack>
                </HStack>
                <VStack alignItems="end" flex={[1]}>
                  <ChipStatus
                    w="fit-content"
                    status={item?.program_beneficiaries[0]?.status}
                    is_duplicate={item?.is_duplicate}
                    is_deactivated={item?.is_deactivated}
                    rounded={"sm"}
                  />
                </VStack>
              </HStack>
            </Pressable>
            <VStack bg="white" alignItems={"end"}>
              {item?.program_beneficiaries[0]?.status === "identified" && (
                <Pressable
                  onPress={() => {
                    navigate(`/beneficiary/${item?.id}/docschecklist`);
                  }}
                >
                  <HStack color="blueText.450" alignItems="center">
                    <FrontEndTypo.H4 color="blueText.450">
                      {t("COMPLETE_THE_DOCUMENTATION")}
                    </FrontEndTypo.H4>
                    <IconByName name="ArrowRightSLineIcon" py="0" />
                  </HStack>
                </Pressable>
              )}
              {item?.program_beneficiaries[0]?.status ===
                "enrollment_pending" && (
                <Pressable
                  onPress={() => {
                    navigate(`/beneficiary/${item?.id}/docschecklist`);
                  }}
                >
                  <HStack color="blueText.450" alignItems="center">
                    <FrontEndTypo.H4 color="blueText.450">
                      {t("CONTINUE_ENROLLMENT")}
                    </FrontEndTypo.H4>
                    <IconByName name="ArrowRightSLineIcon" />
                  </HStack>
                </Pressable>
              )}
              {item?.program_beneficiaries[0]?.status === "ready_to_enroll" && (
                <Pressable
                  onPress={() => {
                    navigate(`/beneficiary/${item?.id}/enrollmentdetails`);
                  }}
                >
                  <HStack color="blueText.450" alignItems="center">
                    <FrontEndTypo.H4 color="blueText.450">
                      {t("ENTER_THE_ENROLLMENT_DETAILS")}
                    </FrontEndTypo.H4>
                    <IconByName name="ArrowRightSLineIcon" />
                  </HStack>
                </Pressable>
              )}
              {["duplicated", "enrolled_ip_verified"]?.includes(
                item?.program_beneficiaries[0]?.status
              ) && (
                <HStack color="blueText.450" alignItems="center" mb="2">
                  <FrontEndTypo.H4 color="blueText.450">
                    {item?.program_beneficiaries[0]?.status === "duplicated"
                      ? t("FOLLOW_UP_WITH_IP_ASSIGNMENT")
                      : t("TO_BE_REGISTERED_IN_CAMP")}
                  </FrontEndTypo.H4>
                </HStack>
              )}
              {item?.program_beneficiaries[0]?.status === "enrolled" && (
                <LearnerMessage
                  program_beneficiaries={item?.program_beneficiaries[0]}
                />
              )}
            </VStack>
          </CardComponent>
        ))
      ) : (
        <FrontEndTypo.H3>{t("DATA_NOT_FOUND")}</FrontEndTypo.H3>
      )}
    </VStack>
  );
};
const select2 = [
  { label: "SORT_ASC", value: "asc" },
  { label: "SORT_DESC", value: "desc" },
];

const styles = {
  inforBox: {
    style: {
      background: "textMaroonColor.50",
    },
  },
};

export default function CampLearnerList({ userTokenInfo, footerLinks }) {
  const [facilitator, setFacilitator] = useState({});
  const navigate = useNavigate();
  const [filter, setFilter] = useState({ limit: 6 });
  const [data, setData] = useState([]);
  const [selectStatus, setSelectStatus] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [loadingHeight, setLoadingHeight] = useState(0);
  const ref = useRef(null);
  const fa_id = localStorage.getItem("id");
  const prerak_status = localStorage.getItem("status");
  const location = useLocation();
  const [campLearners, setCampLearners] = React.useState();
  const { id } = useParams();

  const getPrerakCampProfile = async () => {
    setLoadingList(true);
    try {
      const payload = {
        academic_year_id: location.state?.academic_year_id,
        program_id: location.state?.program_id,
        user_id: location.state?.user_id,
      };
      const result = await campService.getPrerakCampProfile(id, payload);
      console.log("result", result);
      setCampLearners(result?.group_users);
      setLoadingList(false);
    } catch (error) {
      console.error("Error fetching data:", error);

      setLoadingList(false);
    }
  };

  React.useEffect(() => {
    getPrerakCampProfile();
  }, []);

  // useEffect(async () => {
  //   const data = await benificiaryRegistoryService.getStatusList();
  //   if (data.length > 0) {
  //     setSelectStatus(data);
  //   }
  // }, []);

  useEffect(() => {
    if (ref?.current?.clientHeight >= 0 && bodyHeight >= 0) {
      setLoadingHeight(bodyHeight - ref?.current?.clientHeight);
    } else {
      setLoadingHeight(bodyHeight);
    }
  }, [bodyHeight, ref]);

  // useEffect(async () => {
  //   const { currentPage, totalPages, error, ...result } =
  //     await benificiaryRegistoryService.getBeneficiariesList(filter);
  //   if (!error) {
  //     setHasMore(parseInt(`${currentPage}`) < parseInt(`${totalPages}`));
  //     if (filter?.page > 1) {
  //       setData([...data, ...(result.data || [])]);
  //     } else {
  //       setData(result.data || []);
  //     }
  //   } else {
  //     setData([]);
  //   }
  //   setLoadingList(false);
  // }, [filter]);

  // useEffect(async () => {
  //   if (userTokenInfo) {
  //     const fa_data = await facilitatorRegistryService.getOne({ id: fa_id });
  //     setFacilitator(fa_data);
  //   }
  // }, []);

  return (
    <Layout
      getBodyHeight={(e) => setBodyHeight(e)}
      _appBar={{
        onlyIconsShow: ["userInfo", "loginBtn", "langBtn"],
        isEnableSearchBtn: "true",
        setSearch: (value) => {
          setFilter({ ...filter, search: value, page: 1 });
        },
        _box: { bg: "white", shadow: "appBarShadow" },
      }}
      _page={{ _scollView: { bg: "formBg.500" } }}
      _footer={{ menues: footerLinks }}
      analyticsPageTitle={"BENEFICIARY_LIST"}
      pageTitle={t("BENEFICIARY_LIST")}
    >
      {!loadingList ? (
        <InfiniteScroll
          dataLength={data?.length}
          next={(e) =>
            setFilter({
              ...filter,
              page: (filter?.page ? filter?.page : 1) + 1,
            })
          }
          hasMore={hasMore}
          height={loadingHeight}
          // loader={<Loading height="100" />}
          endMessage={
            <FrontEndTypo.H3 bold display="inherit" textAlign="center">
              {data?.length > 0
                ? t("COMMON_NO_MORE_RECORDS")
                : t("DATA_NOT_FOUND")}
            </FrontEndTypo.H3>
          }
          // below props only if you need pull down functionality
          pullDownToRefreshThreshold={50}
        >
          <List data={campLearners} />
        </InfiniteScroll>
      ) : (
        <></>
        // <Loading height={loadingHeight} />
      )}
    </Layout>
  );
}

CampLearnerList.PropTypes = {
  userTokenInfo: PropTypes.any,
  footerLinks: PropTypes.any,
};
