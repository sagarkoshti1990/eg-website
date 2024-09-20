import React from 'react'
import { Button } from 'native-base'
import PropTypes from 'prop-types'

const DefaultButton = ({
  background,
  borderColor,
  textColor,
  children,
  icon,
  ...props
}) => {
  let style = {}
  if (props?.isDisabled) {
    style = {
      background: background || 'white',
      border: borderColor || '10px solid #790000',
      shadow: 'BlackOutlineShadow',
      borderWidth: '1',
      rounded: 'full',
      color: 'white'
    }
  } else {
    style = {
      background: background || 'white',
      shadow: 'BlackOutlineShadow',
      borderColor: 'textMaroonColor.400',
      borderWidth: '1',
      rounded: 'full',
      py: '10px'
    }
  }
  return (
    <Button
      {...style}
      _text={{
        fontSize: '18px',
        fontWeight: '700',
        color: textColor || 'white'
      }}
      rightIcon={icon || ''}
      {...props}
    >
      {children}
    </Button>
  )
}
export default React.memo(DefaultButton)

DefaultButton.propTypes = {
  background: PropTypes.string,
  borderColor: PropTypes.string,
  textColor: PropTypes.string,
  children: PropTypes.any,
  icon: PropTypes.element,
  props: PropTypes.any
}
