import React, { useEffect, useState } from "react";
import {
  CardComponent,
  FrontEndTypo,
  PCusers_layout as Layout,
  campService,
  enumRegistryService,
  GetEnumValue,
} from "@shiksha/common-lib";
import { VStack } from "native-base";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function CampBasicDetails({ userTokenInfo }) {
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [campData, setCampData] = useState({});
  const [enumOptions, setEnumOptions] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    getCampData();
    getEnumData();
  }, []);

  const getEnumData = async () => {
    setLoading(true);
    try {
      const data = await enumRegistryService.listOfEnum();
      setEnumOptions(data?.data ? data?.data : {});
    } catch (error) {
      console.error("Error fetching enum data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCampData = async () => {
    setLoading(true);
    try {
      const res = await campService.getPrerakCampProfile(id, {
        user_id: location.state?.user_id,
        program_id: location.state?.program_id,
        academic_year_id: location.state?.academic_year_id,
      });
      setCampData(res);
    } catch (error) {
      console.error("Error fetching camp data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      _appBar={{
        name: t("CAMP_DETAILS"),
        onPressBackButton: () => {
          navigate(`/camps/${id}`, {
            state: {
              academic_year_id: location.state?.academic_year_id,
              program_id: location.state?.program_id,
              user_id: location.state?.user_id,
            },
          });
        },
      }}
      loading={loading}
      analyticsPageTitle={"BASIC_DETAILS"}
      pageTitle={t("CAMP_DETAILS")}
      stepTitle={t("BASIC_DETAILS")}
      facilitator={userTokenInfo?.authUser || {}}
    >
      <VStack p="4" space={4}>
        <FrontEndTypo.H1 fontWeight="600" mb="3" mt="3">
          {t("BASIC_DETAILS")}
        </FrontEndTypo.H1>
        <CardComponent
          _vstack={{ space: 0 }}
          _hstack={{ borderBottomWidth: 0 }}
          title={t("CAMP_LOCATION")}
          label={[
            "LATITUDE",
            "LONGITUDE",
            "PROPERTY_TYPE",
            "STREET_ADDRESS",
            "DISTRICT",
            "BLOCK",
            "VILLAGE_WARD",
            "GRAMPANCHAYAT",
          ]}
          arr={[
            "lat",
            "long",
            "property_type",
            "street",
            "district",
            "block",
            "village",
            "grampanchayat",
          ]}
          item={{
            ...campData?.properties,
            property_type: campData?.properties?.property_type ? (
              <GetEnumValue
                t={t}
                enumType={"CAMP_PROPERTY_TYPE"}
                enumOptionValue={campData?.properties.property_type}
                enumApiData={enumOptions}
              />
            ) : (
              "-"
            ),
          }}
        />
        <CardComponent
          _vstack={{ space: 0 }}
          _hstack={{ borderBottomWidth: 0 }}
          title={t("CAMP_VENUE_PHOTOS")}
          label={["CAMP_FRONT_VIEW", "STUDY_ROOM", "OTHER"]}
          arr={[
            "property_photo_building",
            "property_photo_classroom",
            "property_photo_other",
          ]}
          item={campData?.properties}
          format={{
            property_photo_building: "file",
            property_photo_classroom: "file",
            property_photo_other: "file",
          }}
        />
      </VStack>
    </Layout>
  );
}

CampBasicDetails.propTypes = {
  userTokenInfo: PropTypes.object,
};
