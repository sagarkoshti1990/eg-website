import React, { useRef, createRef, useState, useEffect } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import schema1 from "../parts/schema.js";
import { Alert, Box, Center, HStack, Image, Modal, VStack } from "native-base";
import Steper from "../../component/Steper";
import {
  facilitatorRegistryService,
  geolocationRegistryService,
  uploadRegistryService,
  Camera,
  Layout,
  H1,
  login,
  H3,
  IconByName,
  BodySmall,
  H2,
  getBase64,
  BodyMedium,
  sendAndVerifyOtp,
  FrontEndTypo,
  getOptions,
  getOnboardingURLData,
  setOnboardingMobile,
  removeOnboardingURLData,
  removeOnboardingMobile,
} from "@shiksha/common-lib";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Clipboard from "component/Clipboard.js";
import {
  templates,
  widgets,
  transformErrors,
  onError,
} from "../../component/BaseInput";
import { useScreenshot } from "use-screenshot-hook";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { setBlock, setDistrict, setVillage } from "utils/localHelper.js";

// App
export default function App({ facilitator, ip, onClick }) {
  //fetch URL data and store fix for 2 times render useEffect call
  const [programData, setProgramData] = useState(null);
  const [countLoad, setCountLoad] = useState(0);
  const [cohortData, setCohortData] = useState(null);

  useEffect(() => {
    const fetchCurrentData = async () => {
      // ...async operations
      if (countLoad == 0) {
        setCountLoad(1);
      }
      if (countLoad == 1) {
        setProgramData(onboardingURLData?.programData);
        let onboardingURLData = await getOnboardingURLData();
        setCohortData(onboardingURLData?.cohortData);
        //end do page load first operation
        setCountLoad(2);
      } else if (countLoad == 2) {
        setCountLoad(3);
      }
    };
    fetchCurrentData();
  }, [countLoad]);

  //already registred modals
  const [isUserExistModal, setIsUserExistModal] = useState(false);
  const [isLoginShow, setIsLoginShow] = useState(false);
  const [isUserExistModalText, setIsUserExistModalText] = useState("");
  const [isUserExistStatus, setIsUserExistStatus] = useState("");

  const [page, setPage] = useState();
  const [pages, setPages] = useState();
  const [schema, setSchema] = useState({});
  const [cameraModal, setCameraModal] = useState(false);
  const [credentials, setCredentials] = useState();
  const [cameraUrl, setCameraUrl] = useState();
  const [cameraFile, setCameraFile] = useState();
  const [submitBtn, setSubmitBtn] = useState();
  const formRef = useRef();
  const uplodInputRef = useRef();
  const [formData, setFormData] = useState(facilitator);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState();
  const [yearsRange, setYearsRange] = useState([1980, 2030]);
  const [lang, setLang] = useState(localStorage.getItem("lang"));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { form_step_number } = facilitator;
  const { t } = useTranslation();
  if (form_step_number && parseInt(form_step_number) >= 10) {
    navigate("/dashboard");
  }

  const onPressBackButton = async () => {
    const data = await nextPrevStep("p");
    if (data && onClick) {
      onClick("SplashScreen");
    }
  };
  const ref = createRef(null);
  const { image, takeScreenshot } = useScreenshot();
  const getImage = () => takeScreenshot({ ref });
  const downloadImage = () => {
    let FileSaver = require("file-saver");
    FileSaver.saveAs(`${image}`, "image.png");
  };

  useEffect(() => {
    if (page && credentials) {
      getImage();
    }
  }, [page, credentials]);

  const uiSchema = {
    dob: {
      "ui:widget": "alt-date",
      "ui:options": {
        yearsRange: yearsRange,
        hideNowButton: true,
        hideClearButton: true,
      },
    },
  };

  const nextPrevStep = async (pageStape = "n") => {
    const index = pages.indexOf(page);
    const properties = schema1.properties;
    setAlert();
    if (index !== undefined) {
      let nextIndex = "";
      if (pageStape.toLowerCase() === "n") {
        nextIndex = pages[index + 1];
      } else {
        nextIndex = pages[index - 1];
      }
      if (nextIndex !== undefined) {
        setSchema(properties[nextIndex]);
        setPage(nextIndex);
      } else if (pageStape.toLowerCase() === "n") {
        await formSubmitUpdate({ ...formData, form_step_number: "10" });
        setPage("upload");
      } else {
        return true;
      }
    }
  };
  const setStep = async (pageNumber = "") => {
    if (schema1.type === "step") {
      const properties = schema1.properties;
      if (pageNumber !== "") {
        if (page !== pageNumber) {
          setPage(pageNumber);
          setSchema(properties[pageNumber]);
        }
      } else {
        nextPrevStep();
      }
    }
  };

  useEffect(async () => {
    if (schema?.properties?.qualification) {
      setLoading(true);
      const qData = await facilitatorRegistryService.getQualificationAll();
      let newSchema = schema;
      if (schema["properties"]["qualification"]) {
        newSchema = getOptions(newSchema, {
          key: "qualification",
          arr: qData,
          title: "name",
          value: "id",
          filters: { type: "qualification" },
        });
        if (newSchema?.properties?.qualification) {
          let valueIndex = "";
          newSchema?.properties?.qualification?.enumNames?.forEach(
            (e, index) => {
              if (e.match("12")) {
                valueIndex = newSchema?.properties?.qualification?.enum[index];
              }
            },
          );
          if (valueIndex !== "" && formData.qualification == valueIndex) {
            setAlert(t("YOU_NOT_ELIGIBLE"));
          } else {
            setAlert();
          }
        }
      }
      if (schema["properties"]["degree"]) {
        newSchema = getOptions(newSchema, {
          key: "degree",
          arr: qData,
          title: "name",
          value: "id",
          filters: { type: "teaching" },
        });
      }
      setSchema(newSchema);
      setLoading(false);
    }

    if (schema?.properties?.state) {
      setLoading(true);
      const qData = await geolocationRegistryService.getStates();
      let newSchema = schema;
      if (schema["properties"]["state"]) {
        newSchema = getOptions(newSchema, {
          key: "state",
          arr: qData?.states,
          title: "state_name",
          value: "state_name",
        });
      }
      newSchema = await setDistrict({
        schemaData: newSchema,
        state: formData?.state,
        district: formData?.district,
        block: formData?.block,
      });
      setSchema(newSchema);
      setLoading(false);
    }

    if (schema?.properties?.device_ownership) {
      if (formData?.device_ownership == "no") {
        setAlert(t("YOU_NOT_ELIGIBLE"));
      } else {
        setAlert();
      }
    }
  }, [page]);

  useEffect(() => {
    if (schema1.type === "step") {
      const properties = schema1.properties;
      const newSteps = Object.keys(properties);
      const arr = ["1", "2"];
      const { id } = facilitator;
      let newPage = [];
      if (id) {
        newPage = newSteps.filter((e) => !arr.includes(e));
        const pageSet = "3";
        setPage(pageSet);
        setSchema(properties[pageSet]);
      } else {
        newPage = newSteps.filter((e) => arr.includes(e));
        setPage(newPage[0]);
        setSchema(properties[newPage[0]]);
      }
      setPages(newPage);
      let minYear = moment().subtract("years", 50);
      let maxYear = moment().subtract("years", 18);
      setYearsRange([minYear.year(), maxYear.year()]);
      setSubmitBtn(t("NEXT"));
    }
    if (facilitator?.id) {
      setFormData(facilitator);
    }
  }, []);

  const userExist = async (filters) => {
    return await facilitatorRegistryService.isExist(filters);
  };

  const formSubmitUpdate = async (formData) => {
    const { id } = facilitator;
    if (id) {
      setLoading(true);
      const result = await facilitatorRegistryService.stepUpdate({
        ...formData,
        parent_ip: ip?.id,
        id: id,
      });
      setLoading(false);
      return result;
    }
  };

  const uploadProfile = async () => {
    const { id } = facilitator;
    if (id) {
      setLoading(true);
      const form_data = new FormData();
      const item = {
        file: cameraFile,
        document_type: "profile",
        user_id: id,
      };
      for (let key in item) {
        form_data.append(key, item[key]);
      }
      const result = await uploadRegistryService.uploadFile(form_data);
      setLoading(false);
      return result;
    }
  };

  const formSubmitCreate = async (formData) => {
    setLoading(true);
    const result = await facilitatorRegistryService.register(
      {
        ...formData,
        mobile: `${formData.mobile}`,
        parent_ip: ip?.id,
      },
      programData?.program_id,
      cohortData?.academic_year_id,
    );
    setLoading(false);
    return result;
  };

  const goErrorPage = (key) => {
    if (key) {
      pages.forEach((e) => {
        const data = schema1["properties"][e]["properties"][key];
        if (data) {
          setStep(e);
        }
      });
    }
  };

  const validate = (data, key) => {
    let error = {};
    switch (key) {
      case "mobile":
        if (data?.mobile?.toString()?.length !== 10) {
          error = { mobile: t("MINIMUM_LENGTH_IS_10") };
        }
        if (!(data?.mobile > 6000000000 && data?.mobile < 9999999999)) {
          error = { mobile: t("PLEASE_ENTER_VALID_NUMBER") };
        }
        break;
      case "aadhar_no":
        if (
          data?.aadhar_no &&
          !`${data?.aadhar_no}`?.match(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/)
        ) {
          error = { aadhar_no: t("AADHAAR_SHOULD_BE_12_DIGIT_VALID_NUMBER") };
        }
        break;
      case "dob":
        const years = moment().diff(data?.dob, "years");
        if (years < 18) {
          error = { dob: t("MINIMUM_AGE_18_YEAR_OLD") };
        }
        break;
      case "grampanchayat":
      case "first_name":
      case "last_name":
      case "middle_name":
        // do some thing
        break;
      case "vo_experience":
      case "experience":
        ["vo_experience", "experience"].forEach((keyex) => {
          data?.[keyex]?.map((item, index) => {
            ["role_title", "organization", "description"].forEach((key) => {
              if (item?.[key]) {
                if (
                  !item?.[key]?.match(/^[a-zA-Z ]*$/g) ||
                  item?.[key]?.replaceAll(" ", "") === ""
                ) {
                  errors[keyex][index]?.[key]?.addError(
                    `${t("REQUIRED_MESSAGE")} ${t(
                      schema?.properties?.[key]?.title,
                    )}`,
                  );
                } else if (key === "description" && item?.[key].length > 200) {
                  errors[keyex][index]?.[key]?.addError(
                    `${t("MAX_LENGHT_200")} ${t(
                      schema?.properties?.[key]?.title,
                    )}`,
                  );
                }
              }
            });
          });
        });
        break;
      default:
        break;
    }
    return error;
  };

  const customValidate = (data, err) => {
    const arr = Object.keys(err);
    arr.forEach((key) => {
      const isValid = validate(data, key);
      if (isValid?.[key]) {
        if (!errors?.[key]?.__errors.includes(isValid[key]))
          err?.[key]?.addError(isValid[key]);
      }
    });

    return err;
  };

  const checkMobileExist = async (mobile) => {
    const result = await facilitatorRegistryService.isUserExist({ mobile });
    if (result?.data) {
      let response_isUserExist = result?.data;
      if (
        (response_isUserExist?.program_faciltators &&
          response_isUserExist?.program_faciltators.length > 0) ||
        (response_isUserExist?.program_beneficiaries &&
          response_isUserExist?.program_beneficiaries.length > 0)
      ) {
        const newErrors = {
          mobile: {
            __errors: [t("MOBILE_NUMBER_ALREADY_EXISTS")],
          },
        };
        setErrors(newErrors);
        setIsUserExistModal(true);
        if (response_isUserExist?.program_beneficiaries.length > 0) {
          setIsUserExistStatus("DONT_ALLOW_MOBILE");
          setIsUserExistModalText(t("DONT_ALLOW_MOBILE"));
          setIsLoginShow(false);
        } else if (response_isUserExist?.program_faciltators.length > 0) {
          for (
            let i = 0;
            i < response_isUserExist?.program_faciltators.length;
            i++
          ) {
            let facilator_data = response_isUserExist?.program_faciltators[i];
            if (facilator_data?.program_id == programData?.program_id) {
              if (
                facilator_data?.academic_year_id == cohortData?.academic_year_id
              ) {
                setIsUserExistStatus("EXIST_LOGIN");
                setIsUserExistModalText(
                  t("EXIST_LOGIN")
                    .replace("{{state}}", programData?.program_name)
                    .replace("{{year}}", cohortData?.academic_year_name),
                );
                setIsLoginShow(true);
                break;
              } else if (
                facilator_data?.academic_year_id != cohortData?.academic_year_id
              ) {
                const academic_year =
                  await facilitatorRegistryService.getCohort({
                    cohortId: facilator_data?.academic_year_id,
                  });
                const program_data =
                  await facilitatorRegistryService.getProgram({
                    programId: facilator_data?.program_id,
                  });
                setIsUserExistStatus("REGISTER_EXIST");
                setIsUserExistModalText(
                  t("REGISTER_EXIST")
                    .replace("{{state}}", programData?.program_name)
                    .replace("{{year}}", cohortData?.academic_year_name)
                    .replace("{{old_state}}", program_data[0]?.program_name)
                    .replace("{{old_year}}", academic_year?.academic_year_name),
                );
                setOnboardingMobile(mobile);
                setIsLoginShow(true);
              }
            } else {
              const academic_year = await facilitatorRegistryService.getCohort({
                cohortId: facilator_data?.academic_year_id,
              });
              const program_data = await facilitatorRegistryService.getProgram({
                programId: facilator_data?.program_id,
              });
              setIsUserExistStatus("DONT_ALLOW");
              setIsUserExistModalText(
                t("DONT_ALLOW")
                  .replace("{{state}}", programData?.program_name)
                  .replace("{{year}}", cohortData?.academic_year_name)
                  .replace("{{old_state}}", program_data[0]?.program_name)
                  .replace("{{old_year}}", academic_year?.academic_year_name),
              );
              setIsLoginShow(false);
              break;
            }
          }
        }
        return true;
      } else {
        setIsUserExistModal(false);
      }
    }
    return false;
  };

  const onChange = async (e, id) => {
    const data = e.formData;
    const newData = { ...formData, ...data };
    setFormData(newData);
    if (id === "root_mobile") {
      let { mobile, otp, ...otherError } = errors || {};
      setErrors(otherError);
      if (data?.mobile?.toString()?.length === 10) {
        await checkMobileExist(data?.mobile);
      }
      if (schema?.properties?.otp) {
        const { otp, ...properties } = schema?.properties || {};
        const required = schema?.required.filter((item) => item !== "otp");
        setSchema({ ...schema, properties, required });
        setFormData((e) => {
          const { otp, ...fData } = e;
          return fData;
        });
      }
    }
    if (id === "root_aadhar_no") {
      let { aadhar_no, ...otherError } = errors || {};
      setErrors(otherError);
      if (data?.aadhar_no?.toString()?.length === 12) {
        const result = await userExist({
          aadhar_no: data?.aadhar_no,
        });
        if (result?.success) {
          const newErrors = {
            aadhar_no: {
              __errors: [t("AADHAAR_NUMBER_ALREADY_EXISTS")],
            },
          };
          setErrors(newErrors);
        }
      }
    }

    if (id === "root_qualification") {
      if (schema?.properties?.qualification) {
        let valueIndex = "";
        schema?.properties?.qualification?.enumNames?.forEach((e, index) => {
          if (e.match("12")) {
            valueIndex = schema?.properties?.qualification?.enum[index];
          }
        });
        if (valueIndex !== "" && data.qualification == valueIndex) {
          setAlert(t("YOU_NOT_ELIGIBLE"));
        } else {
          setAlert();
        }
      }
    }

    if (id === "root_device_ownership") {
      if (schema?.properties?.device_ownership) {
        if (data?.device_ownership == "no") {
          setAlert(t("YOU_NOT_ELIGIBLE"));
        } else {
          setAlert();
        }
      }
    }

    if (id === "root_state") {
      await setDistrict({
        schemaData: schema,
        state: data?.state,
        district: data?.district,
        block: data?.block,
      });
    }

    if (id === "root_district") {
      await setBlock({
        district: data?.district,
        block: data?.block,
        schemaData: schema,
      });
    }

    if (id === "root_block") {
      await setVillage({ block: data?.block, schemaData: schema });
    }

    if (id === "root_otp") {
      if (errors?.otp) {
        const newErrors = {};
        setErrors(newErrors);
      }
    }
  };

  const userExistClick = () => {
    if (
      isUserExistStatus == "EXIST_LOGIN" ||
      isUserExistStatus == "REGISTER_EXIST"
    ) {
      navigate("/");
    } else {
      setIsUserExistModal(false);
    }
  };

  const onSubmit = async (data) => {
    let newFormData = data.formData;
    if (schema?.properties?.first_name) {
      newFormData = {
        ...newFormData,
        ["first_name"]: newFormData?.first_name?.replaceAll(" ", ""),
      };
    }

    if (schema?.properties?.last_name && newFormData?.last_name) {
      newFormData = {
        ...newFormData,
        ["last_name"]: newFormData?.last_name?.replaceAll(" ", ""),
      };
    }

    const newData = {
      ...formData,
      ...newFormData,
      ["form_step_number"]: parseInt(page) + 1,
    };
    setFormData(newData);

    if (_.isEmpty(errors) || errors?.otp) {
      const { id } = facilitator;
      let success = false;
      if (id) {
        success = true;
      } else if (page === "2") {
        const resultCheck = await checkMobileExist(newFormData?.mobile);
        if (!resultCheck) {
          if (!schema?.properties?.otp) {
            const { otp: data, ...allData } = newFormData || {};
            setFormData(allData);
            newFormData = allData;
            let { mobile, otp, ...otherError } = errors || {};
            setErrors(otherError);
          }
          const { status, newSchema } = await sendAndVerifyOtp(schema, {
            ...newFormData,
            hash: localStorage.getItem("hash"),
          });
          if (status === true) {
            const data = await formSubmitCreate(newFormData);
            if (data?.error) {
              const newErrors = {
                mobile: {
                  __errors:
                    data?.error?.constructor?.name === "String"
                      ? [data?.error]
                      : data?.error?.constructor?.name === "Array"
                        ? data?.error
                        : [t("MOBILE_NUMBER_ALREADY_EXISTS")],
                },
              };
              setErrors(newErrors);
            } else {
              if (data?.username && data?.password) {
                await removeOnboardingURLData();
                await removeOnboardingMobile();
                setCredentials(data);
              }
            }
          } else if (status === false) {
            const newErrors = {
              otp: {
                __errors: [t("USER_ENTER_VALID_OTP")],
              },
            };
            setErrors(newErrors);
          } else {
            setSchema(newSchema);
          }
        }
      } else if (page <= 1) {
        success = true;
      }
      if (success) {
        setStep();
      }
    } else {
      const key = Object.keys(errors);
      if (key[0]) {
        goErrorPage(key[0]);
      }
    }
  };

  const handleFileInputChange = async (e) => {
    let file = e.target.files[0];
    if (file.size <= 1048576 * 25) {
      const data = await getBase64(file);
      setCameraUrl(data);
      setCameraFile(file);
    } else {
      setErrors({ fileSize: t("FILE_SIZE") });
    }
  };

  if (cameraUrl) {
    return (
      <Layout
        _appBar={{
          lang,
          setLang,
          onPressBackButton: (e) => {
            setCameraUrl();
            setCameraModal(false);
          },
        }}
        _page={{ _scollView: { bg: "white" } }}
      >
        <VStack py={6} px={4} mb={5} space="6">
          <Box p="10">
            <Steper
              type={"circle"}
              steps={[
                { value: "6", label: t("BASIC_DETAILS") },
                { value: "3", label: t("WORK_DETAILS") },
                { value: "1", label: t("OTHER_DETAILS") },
              ]}
              progress={page === "upload" ? 10 : page}
            />
          </Box>
          <H1 color="red.1000">{t("ADD_PROFILE_PHOTO")}</H1>
          <h5 color="red.1000" fontSize="3">
            {t("CLEAR_PROFILE_MESSAGE")}
          </h5>
          <Center>
            <Image
              source={{
                uri: cameraUrl,
              }}
              alt=""
              size="324px"
            />
          </Center>
          <FrontEndTypo.Primarybutton
            isLoading={loading}
            onPress={async (e) => {
              await uploadProfile();
              if (onClick) onClick("success");
            }}
          >
            {t("SUBMIT")}
          </FrontEndTypo.Primarybutton>
          <FrontEndTypo.Secondarybutton
            isLoading={loading}
            leftIcon={<IconByName name="CameraLineIcon" isDisabled />}
            onPress={(e) => {
              setCameraUrl();
              setCameraModal(true);
            }}
          >
            {t("TAKE_ANOTHER_PHOTO")}
          </FrontEndTypo.Secondarybutton>
        </VStack>
      </Layout>
    );
  }
  if (cameraModal) {
    return (
      <Camera
        {...{
          cameraModal,
          setCameraModal,
          cameraUrl,
          setCameraUrl: async (url, blob) => {
            setCameraUrl(url);
            setCameraFile(blob);
          },
        }}
      />
    );
  }

  if (page === "upload") {
    return (
      <Layout
        _appBar={{ onPressBackButton: (e) => setPage("10"), lang, setLang }}
        _page={{ _scollView: { bg: "white" } }}
      >
        <VStack py={6} px={4} mb={5} space="6" bg="gray.100">
          <Box p="10">
            <Steper
              type={"circle"}
              steps={[
                { value: "6", label: t("BASIC_DETAILS") },
                { value: "3", label: t("WORK_DETAILS") },
                { value: "1", label: t("OTHER_DETAILS") },
              ]}
              progress={page === "upload" ? 10 : page}
            />
          </Box>
          <H1 color="red.1000">{t("JUST_ONE_STEP")}</H1>
          <H2 color="red.1000">{t("ADD_PROFILE_PHOTO")} -</H2>
          <FrontEndTypo.Primarybutton
            isLoading={loading}
            variant={"primary"}
            leftIcon={
              <IconByName
                name="CameraLineIcon"
                color="white"
                size={2}
                isDisabled
              />
            }
            onPress={(e) => {
              setCameraUrl();
              setCameraModal(true);
            }}
          >
            {t("TAKE_PHOTO")}
          </FrontEndTypo.Primarybutton>
          <VStack space={2}>
            <Box>
              <input
                accept="image/*"
                type="file"
                style={{ display: "none" }}
                ref={uplodInputRef}
                onChange={handleFileInputChange}
              />
              <FrontEndTypo.Secondarybutton
                isLoading={loading}
                leftIcon={<IconByName name="Download2LineIcon" isDisabled />}
                onPress={(e) => {
                  uplodInputRef?.current?.click();
                }}
              >
                {t("UPLOAD_PHOTO")}
              </FrontEndTypo.Secondarybutton>
            </Box>
            {errors?.fileSize && <H2 color="red.400">{errors?.fileSize}</H2>}
          </VStack>
          <FrontEndTypo.Primarybutton
            isLoading={loading}
            onPress={async (e) => {
              await formSubmitUpdate({ ...formData, form_step_number: "10" });
              if (onClick) onClick("success");
            }}
          >
            {t("SKIP_SUBMIT")}
          </FrontEndTypo.Primarybutton>
        </VStack>
      </Layout>
    );
  }

  return (
    <Layout
      _appBar={{
        onPressBackButton,
        exceptIconsShow:
          `${page}` === "1" ? ["menuBtn"] : ["menuBtn", "notificationBtn"],
        name: `${ip?.name}`.trim(),
        lang,
        setLang,
        _box: { bg: "white", shadow: "appBarShadow" },
        onlyIconsShow: ["backBtn"],
      }}
      _page={{ _scollView: { bg: "formBg.500" } }}
    >
      <Box py={6} px={4} mb={5}>
        <Box px="2" pb="10">
          <Steper
            type={"circle"}
            steps={[
              { value: "6", label: t("BASIC_DETAILS") },
              { value: "3", label: t("WORK_DETAILS") },
              { value: "1", label: t("OTHER_DETAILS") },
            ]}
            progress={page - 1}
          />
        </Box>
        <Alert status="info" shadow="AlertShadow" alignItems={"start"} mb="3">
          <HStack alignItems="center" space="2" color>
            <Alert.Icon />
            <FrontEndTypo.H3>
              {t("REGISTER_MESSAGE")
                .replace("{{state}}", programData?.program_name)
                .replace("{{year}}", cohortData?.academic_year_name)}
            </FrontEndTypo.H3>
          </HStack>
        </Alert>
        {alert && (
          <Alert status="warning" alignItems={"start"} mb="3">
            <HStack alignItems="center" space="2" color>
              <Alert.Icon />
              <BodyMedium>{alert}</BodyMedium>
            </HStack>
          </Alert>
        )}
        {page && page !== "" && (
          <Form
            key={lang}
            ref={formRef}
            extraErrors={errors}
            showErrorList={false}
            noHtml5Validate={true}
            {...{
              widgets,
              templates,
              validator,
              schema: schema || {},
              uiSchema,
              formData,
              customValidate,
              onChange,
              onError,
              onSubmit,
              transformErrors: (errors) => transformErrors(errors, schema, t),
            }}
          >
            {page === "2" ? (
              <FrontEndTypo.Primarybutton
                mt="3"
                variant={"primary"}
                type="submit"
                onPress={(e) => {
                  formRef?.current?.submit();
                }}
              >
                {schema?.properties?.otp ? t("VERIFY_OTP") : t("SEND_OTP")}
              </FrontEndTypo.Primarybutton>
            ) : (
              <FrontEndTypo.Primarybutton
                isLoading={loading}
                type="submit"
                p="4"
                mt="10"
                onPress={(e) => {
                  formRef?.current?.submit();
                }}
              >
                {pages[pages?.length - 1] === page ? t("SUBMIT") : submitBtn}
              </FrontEndTypo.Primarybutton>
            )}
          </Form>
        )}
      </Box>
      <Modal
        isOpen={isUserExistModal}
        safeAreaTop={true}
        size="xl"
        _backdrop={{ opacity: "0.7" }}
      >
        <Modal.Content>
          <Modal.Body p="5" pb="10">
            <VStack space="5">
              <H1 textAlign="center">
                <Alert.Icon />
              </H1>
              <FrontEndTypo.H2 textAlign="center">
                {isUserExistModalText}
              </FrontEndTypo.H2>
              <HStack space="5" pt="5">
                <FrontEndTypo.Primarybutton
                  flex={1}
                  onPress={async (e) => {
                    userExistClick();
                  }}
                >
                  {isLoginShow ? t("LOGIN") : t("OK")}
                </FrontEndTypo.Primarybutton>
              </HStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={credentials}
        safeAreaTop={true}
        size="xl"
        _backdrop={{ opacity: "0.7" }}
      >
        <Modal.Content>
          <Modal.Header p="5" borderBottomWidth="0">
            <H1 textAlign="center">{t("STORE_YOUR_CREDENTIALS")}</H1>
          </Modal.Header>
          <Modal.Body p="5" pb="10">
            <VStack space="5">
              <VStack
                space="2"
                bg="gray.100"
                p="1"
                rounded="lg"
                borderWidth={1}
                borderColor="gray.300"
                w="100%"
              >
                <HStack alignItems="center" space="1" flex="1">
                  <H3 flex="0.3">{t("USERNAME")}</H3>
                  <BodySmall
                    py="1"
                    px="2"
                    flex="0.7"
                    wordWrap="break-word"
                    whiteSpace="break-spaces"
                    overflow="hidden"
                    bg="success.100"
                    borderWidth="1"
                    borderColor="success.500"
                  >
                    {credentials?.username}
                  </BodySmall>
                </HStack>
                <HStack alignItems="center" space="1" flex="1">
                  <H3 flex="0.3">{t("PASSWORD")}</H3>
                  <BodySmall
                    py="1"
                    px="2"
                    flex="0.7"
                    wordWrap="break-word"
                    whiteSpace="break-spaces"
                    overflow="hidden"
                    bg="success.100"
                    borderWidth="1"
                    borderColor="success.500"
                  >
                    {credentials?.password}
                  </BodySmall>
                </HStack>
              </VStack>
              <VStack alignItems="center">
                <Clipboard
                  text={`username: ${credentials?.username}, password: ${credentials?.password}`}
                  onPress={(e) => {
                    setCredentials({ ...credentials, copy: true });
                    downloadImage();
                  }}
                >
                  <HStack space="3">
                    <IconByName
                      name="FileCopyLineIcon"
                      isDisabled
                      rounded="full"
                      color="blue.300"
                    />
                    <H3 color="blue.300">
                      {t("CLICK_HERE_TO_COPY_AND_LOGIN")}
                    </H3>
                  </HStack>
                </Clipboard>
              </VStack>
              <HStack space="5" pt="5">
                <FrontEndTypo.Primarybutton
                  flex={1}
                  isDisabled={!credentials?.copy}
                  onPress={async (e) => {
                    const { copy, ...cData } = credentials;
                    await login(cData);
                    navigate("/");
                    navigate(0);
                  }}
                >
                  {t("LOGIN")}
                </FrontEndTypo.Primarybutton>
              </HStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Layout>
  );
}

App.propTypes = {
  facilitator: PropTypes.object,
  ip: PropTypes.any,
  onClick: PropTypes.func,
};
