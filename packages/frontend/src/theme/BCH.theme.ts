import {
  black,
  blue,
  green,
  purple,
  grey,
  red,
  white,
  BCHgreen,
} from './colors'

const BCHtheme = {
  borderRadius: 12,
  breakpoints: {
    mobile: 500,
  },
  color: {
    black,
    grey,
    blue,
    purple,
    // BCHgreen: BCHgreen,
    primary: {
      light: BCHgreen[100],
      main: BCHgreen[100],
    },
    secondary: {
      main: green[500],
    },
    white,
  },
  siteWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 48,
    7: 64,
  },
  topBarSize: 72,
}

export default BCHtheme
