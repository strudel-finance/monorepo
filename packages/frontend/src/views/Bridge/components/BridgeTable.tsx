import { makeStyles, withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableContainer from '@material-ui/core/TableContainer'
import TableBody from '@material-ui/core/TableBody'
import MuiTableCell from '@material-ui/core/TableCell'
import MuiTableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import {
  BTCTransaction,
  LoadingStatus,
  AccountRequest,
  BCHTransaction,
} from '../../../types/types'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import React, { useState, useRef, useEffect } from 'react'
import sb from 'satoshi-bitcoin'
import { getRelayContract } from '../../../tokens/utils'
import { changeEndian } from '../../../utils/changeEndian'
import showError, { handleErrors } from '../../../utils/showError'
import RollbarErrorTracking from '../../../errorTracking/rollbar'
import useInterval from '../../../hooks/useInterval'
import { apiServer } from '../../../constants/backendAddresses'
import ConversionStatus from '../../../components/TransactionsTableContainer/components/ConversionStatus'
import ConversionActions from '../../../components/TransactionsTableContainer/components/ConversionActions'
import useVBCH from '../../../hooks/useVBCH'
import { Vbch } from '../../../tokens/Vbch'
import useBridge from '../../../hooks/useBridge'
import { ExternalLink } from '../../../components/TransactionsTableContainer/components/ExternalLink'

interface BridgeEvent {
  loading: boolean
  xDAIlink?: string
  BSClink?: string
}

interface BridgeTableProps {
  events: BridgeEvent[]
}

const BridgeTable: React.FC<BridgeTableProps> = ({ events }) => {
  const useStyles = makeStyles((theme) => ({
    viewLink: {
      fontSize: 14,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  }))
  const classes = useStyles()

  return (
    <SimpleBar>
      <TableContainer style={{ height: 360 }}>
        <Table color="white" stickyHeader={true}>
          <TableHead>
            <TableRow>
              <TableCell align="left">
                <ReddishBoldTextTypography>Direction</ReddishBoldTextTypography>
              </TableCell>
              <TableCell>
                <ReddishBoldTextTypography>
                  BSC Transaction
                </ReddishBoldTextTypography>
              </TableCell>
              <TableCell>
                <ReddishBoldTextTypography>
                  xDai Transaction
                </ReddishBoldTextTypography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event: BridgeEvent, i: number) => {
              return (
                <TableRow key={i} style={{ height: 95 }}>
                  <TableCell align="left" style={{ width: 125 }}>
                    <ReddishTextTypography variant="caption">
                      BCH → vBCH
                    </ReddishTextTypography>
                  </TableCell>
                  <TableCell>
                    {!event.BSClink ? (
                      'Loading...'
                    ) : (
                      <ExternalLink
                        className={classes.viewLink}
                        href={event.BSClink}
                      >
                        View BSC Transaction
                      </ExternalLink>
                    )}
                    {/* <Typography variant="caption">{event.txHash}</Typography> */}
                  </TableCell>

                  <TableCell>
                    {!event.xDAIlink ? (
                      'Loading...'
                    ) : (
                      <ExternalLink
                        className={classes.viewLink}
                        href={event.xDAIlink}
                      >
                        View xDai Transaction
                      </ExternalLink>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </SimpleBar>
  )
}

export const ReddishTextTypography = withStyles({
  root: {
    color: '#322015',
    fontFamily: 'azo-sans-web',
    fontSize: 16,
  },
})(Typography)

const ReddishBoldTextTypography = withStyles({
  root: {
    fontWeight: 700,
  },
})(ReddishTextTypography)

const TableCell = withStyles({
  stickyHeader: {
    background: 'white',
  },
  root: {
    // height: 10,
  },
})(MuiTableCell)

// const TableContainer = withStyles({
//   root: { height: 240 }
// })(MuiTableCell)

const TableHead = withStyles({
  // root: {
  //   background: 'transparent',
  // },
})(MuiTableHead)

const useStyles = makeStyles((theme) => ({
  container: {
    borderColor: 'none',
    background: '#FFFFFF',
    // border: '1px solid #e2d6cfff',
    borderRadius: '12px',
    minHeight: 200,
    height: '100%',
  },
  titleWrapper: {
    paddingBottom: theme.spacing(2),
  },

  //box-shadow: -3px 7px 17px 4px #00000014;
  actionsCell: {
    minWidth: 150,
  },
  emptyMessage: {
    display: 'flex',
    paddingTop: theme.spacing(8),
    justifyContent: 'center',
    height: '100%',
  },
}))

export default BridgeTable
