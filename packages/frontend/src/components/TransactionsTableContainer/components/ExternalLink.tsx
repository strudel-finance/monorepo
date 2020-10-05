import React from 'react'

import {AProps} from './jsx'

type Props = AProps

export const ExternalLink: React.FC<Props> = ({
  children,
  defaultValue,
  ...props
}) => (
  // tslint:disable-next-line: react-a11y-anchors
  <a
    defaultValue={defaultValue as string[]}
    {...props}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
)
