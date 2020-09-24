import {makeStyles, withStyles} from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import ConversionStatus from './components/ConversionStatus'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import React from 'react'

export const ReddishTextTypography = withStyles({
  root: {
    color: '#5b3926',
    fontFamily: 'Noto Sans',
    fontSize: 16,
  },
})(Typography)

const ReddishBoldTextTypography = withStyles({
  root: {
    fontWeight: 700,
  },
})(ReddishTextTypography)

const useStyles = makeStyles((theme) => ({
  container: {
    background: '#f0e9e7',
    border: '1px solid #e2d6cfff',
    boxShadow: 'inset 1px 1px 0px #f7f4f2',
    borderRadius: '12px',
    minHeight: 200,
    height: '100%',
  },
  titleWrapper: {
    paddingBottom: theme.spacing(2),
  },
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

export interface Transaction {
  txCreatedAt: Date
  value: number
  confirmed: boolean
  confirmations: number
  awaiting: string
  btcTxHash: string
}

export interface TransactionTableProps {
  transactions: Transaction[]
}

const TransactionsTableContainer: React.FC<TransactionTableProps> = ({
  transactions,
}) => {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <SimpleBar style={{maxHeight: 250}}>
        <Table color="primary">
          <TableHead>
            <TableRow>
              <TableCell align="left">
                <ReddishBoldTextTypography>
                  Transaction
                </ReddishBoldTextTypography>
              </TableCell>
              <TableCell>
                <ReddishBoldTextTypography>Status</ReddishBoldTextTypography>
              </TableCell>
              <TableCell>
                <div className={classes.actionsCell}></div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .sort((txa, txb) => {
                return (txa.txCreatedAt ?? 0) < (txb?.txCreatedAt ?? 0) ? 1 : 0
              })
              .map((tx, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell align="left">
                      <ReddishTextTypography variant="caption">
                        {tx.value} BTC → vBTC
                      </ReddishTextTypography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        <ConversionStatus tx={tx} />
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Grid container justify="flex-end"></Grid>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </SimpleBar>
    </div>
  )
}

export default TransactionsTableContainer
