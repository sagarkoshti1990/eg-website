import React, { useState } from 'react'
import {
  HStack,
  Box,
  StatusBar,
  Pressable,
  Input,
  Menu,
  Stack,
  InputLeftAddon,
  InputGroup,
  InputRightAddon,
  Text,
  Avatar,
  Button,
  Modal,
  sm,
  xs
} from 'native-base'
import { useNavigate } from 'react-router-dom'
import IconByName from '../IconByName'
import { BodyLarge, Caption } from './HeaderTags'
import { logout } from '../helper'
import { changeLanguage, t } from 'i18next'

export default function AppBar({
  isEnableSearchBtn,
  setSearch,
  setSearchState,
  color,
  languages,
  onPressBackButton,
  rightIcon,
  onlyIconsShow,
  exceptIconsShow,
  name,
  lang,
  setLang,
  ...props
}) {
  const [searchInput, setSearchInput] = useState(false)
  const profile_url = localStorage.getItem('profile_url')

  const headerName = localStorage.getItem('fullName')
    ? localStorage.getItem('fullName')
    : name
    ? name
    : ''
  const token = localStorage.getItem('token')
  const navigate = useNavigate()
  const [modal, setModal] = React.useState(false)
  const styles = {
    bottom: {
      marginBottom: 0,
      marginTop: 'auto',
      scroll: 'auto'
    }
  }
  const changeMenu = (e) => {
    if (e === 'logout') {
      logout()
      navigate('/login')
      navigate(0)
    } else {
      localStorage.setItem('lang', e)
      changeLanguage(e)
      setLang ? setLang(e) : navigate(0)
    }
  }
  const handleSeachState = (boolean) => {
    if (setSearchState) setSearchState(boolean)
    setSearchInput(boolean)
  }

  const isShow = (item) =>
    (!onlyIconsShow || onlyIconsShow.includes(item)) &&
    (!exceptIconsShow || !exceptIconsShow.includes(item))

  return (
    <Box
      p='4'
      borderBottomWidth='1'
      borderBottomColor={'gray.300'}
      {...props?._box}
    >
      <HStack justifyContent={'flex-end'} space='2'>
        {isShow('helpBtn') ? (
          <Box>
            <Button
              py='1'
              px='2'
              variant='redOutlineBtn'
              _text={{
                fontWeight: '600',
                fontSize: '10px'
              }}
              onPress={() => setModal('bottom')}
            >
              {t('HELP')}
            </Button>
            <Modal
              isOpen={modal}
              onClose={() => setModal(false)}
              size='xl'
              avoidKeyboard
              justifyContent='flex-end'
              bottom='4'
            >
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header p='5' fontSize='16' borderBottomWidth='0'>
                  {t('NEED_HELP')}
                </Modal.Header>
                <Modal.Body p='5' pb='10' overflowX='auto'>
                  <HStack space='3' align-items='stretch'>
                    {[
                      {
                        icon: 'MessageLineIcon',
                        name: 'FREQUENTLY_ASKED_QUESTION'
                      },
                      {
                        icon: 'CustomerService2LineIcon',
                        name: 'CALL_SUPPORT'
                      },
                      { icon: 'CellphoneLineIcon', name: 'CALL_MY_IP' }
                    ].map((item, index) => (
                      <Box
                        p='4'
                        flex='1'
                        borderWidth='1'
                        borderColor='coolGray.500'
                        rounded='lg'
                        bg='textGreyColor.400'
                        alignItems='center'
                        gap='10px'
                      >
                        <IconByName
                          color='coolGray.500'
                          name={item?.icon}
                          isDisabled
                        />
                        <BodyLarge color='coolGray.500' textAlign='center'>
                          {t(item?.name)}
                        </BodyLarge>
                      </Box>
                    ))}
                  </HStack>
                </Modal.Body>
              </Modal.Content>
            </Modal>
          </Box>
        ) : (
          <React.Fragment />
        )}

        {isShow('loginBtn') ? (
          <Box>
            {token ? (
              <HStack>
                <Button
                  py='1'
                  px='2'
                  variant='redOutlineBtn'
                  _text={{
                    fontWeight: '600',
                    fontSize: '10px'
                  }}
                  onPress={(e) => changeMenu('logout')}
                >
                  {t('LOGOUT')}
                </Button>
              </HStack>
            ) : (
              <HStack space={2}>
                <Button
                  py='1'
                  px='2'
                  variant='redOutlineBtn'
                  _text={{
                    fontWeight: '600',
                    fontSize: '10px'
                  }}
                  onPress={(e) => navigate('/login')}
                >
                  {t('LOGIN')}
                </Button>
              </HStack>
            )}
          </Box>
        ) : (
          <React.Fragment />
        )}
      </HStack>
      <StatusBar bg='gray.600' barStyle='light-content' />
      {/* <Box safeAreaTop bg='gray.600' /> */}

      {searchInput ? (
        <Stack alignItems='center'>
          <InputGroup width='100%'>
            <InputLeftAddon
              p='0'
              bg='transparent'
              borderWidth='0'
              children={
                <IconByName
                  size='sm'
                  name='ArrowLeftSLineIcon'
                  color={color ? color : ''}
                  onPress={() => {
                    if (onPressBackButton) {
                      onPressBackButton()
                    } else {
                      navigate(-1)
                    }
                  }}
                />
              }
            />
            <Input
              variant='unstyled'
              bg='transparent'
              size={'full'}
              placeholder={t('SEARCH')}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputRightAddon
              p='0'
              bg='transparent'
              borderWidth='0'
              children={
                <IconByName
                  color='coolGray.500'
                  name='CloseCircleLineIcon'
                  p='0'
                  onPress={(e) => handleSeachState(false)}
                />
              }
            />
          </InputGroup>
        </Stack>
      ) : isShow('backBtn') || isShow('userInfo') || isShow('langBtn') ? (
        <HStack
          bg='transparent'
          justifyContent='space-between'
          alignItems='center'
          minH='32px'
        >
          <HStack space='4' alignItems='center'>
            {isShow('backBtn') ? (
              <IconByName
                size='sm'
                pl='0'
                name='ArrowLeftSLineIcon'
                color={color ? color : ''}
                onPress={() => {
                  if (onPressBackButton) {
                    onPressBackButton()
                  } else {
                    navigate(-1)
                  }
                }}
              />
            ) : (
              <React.Fragment />
            )}
            {isShow('userInfo') ? (
              <HStack space='1' alignItems='center'>
                {profile_url ? (
                  <Avatar
                    source={{
                      uri: profile_url
                    }}
                    alt='Image not found'
                    width={'30px'}
                    height={'30px'}
                  />
                ) : (
                  <IconByName
                    isDisabled
                    name='AccountCircleLineIcon'
                    color='gray.300'
                    _icon={{ size: '40px' }}
                  />
                )}
                <BodyLarge
                  wordWrap='break-word'
                  width='181px'
                  whiteSpace='nowrap'
                  overflow='hidden'
                  textOverflow='ellipsis'
                >
                  {headerName}
                </BodyLarge>
              </HStack>
            ) : (
              <React.Fragment />
            )}
          </HStack>

          <HStack alignItems={'center'}>
            {!searchInput && isEnableSearchBtn ? (
              <IconByName
                color={color ? color : ''}
                size='sm'
                name='SearchLineIcon'
                onPress={(e) => handleSeachState(true)}
              />
            ) : (
              <React.Fragment />
            )}

            {isShow('langBtn') ? (
              <Stack px='3'>
                <Menu
                  right='100%'
                  w='190'
                  placement='bottom right'
                  trigger={(triggerProps) => {
                    return (
                      <Pressable
                        accessibilityLabel='More options menu'
                        {...triggerProps}
                      >
                        <HStack space={2}>
                          <Text>
                            {(lang && lang !== '') ||
                            localStorage.getItem('lang')
                              ? languages.find(
                                  (e) =>
                                    e?.code === lang ||
                                    e?.code === localStorage.getItem('lang')
                                )?.['title']
                              : 'En'}
                          </Text>
                          <IconByName
                            size='sm'
                            pr='0'
                            name='ArrowDownSFillIcon'
                            isDisabled={true}
                            color={color ? color : ''}
                          />
                        </HStack>
                      </Pressable>
                    )
                  }}
                >
                  {languages?.map((e, index) => (
                    <Menu.Item
                      key={index}
                      label={e.title}
                      textValue={e.code}
                      onPress={(item) => changeMenu(e.code)}
                    >
                      {e.title}
                    </Menu.Item>
                  ))}
                </Menu>
              </Stack>
            ) : (
              <React.Fragment />
            )}
          </HStack>
        </HStack>
      ) : (
        <React.Fragment />
      )}
    </Box>
  )
}
