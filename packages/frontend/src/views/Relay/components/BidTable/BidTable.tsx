import React from 'react'
import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@material-ui/core'
import { gql, useQuery } from '@apollo/client'
import BN from 'bignumber.js'
import { DateTime } from 'luxon'
import styled from 'styled-components'

interface RelayTableHeadProps {
  classes: Object
  rowCount: number
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  topBar: {
    fontWeight: 'bold',
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}))

const RelayTableHead: React.FC<RelayTableHeadProps> = (props) => {
  const classes = useStyles()
  const headCells = [
    {
      id: 'Bid',
      numeric: false,
      disablePadding: false,
      label: 'Bid',
    },
    { id: 'Address', numeric: true, disablePadding: false, label: 'Address' },
    { id: 'Time', numeric: true, disablePadding: false, label: 'Time' },
  ]

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            className={classes.topBar}
            key={headCell.id}
            padding={headCell.disablePadding ? 'none' : 'default'}
          >
            <TableSortLabel>{headCell.label}</TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

interface TableData {
  startBlock: number
}

interface BidItem {
  amount: string
  relayer: string
  slotStartBlock: string
  time: string
}

const BidTable: React.FC<TableData> = ({ startBlock }) => {
  const classes = useStyles()
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const START_BLOCK = gql`
  query StartBlockQuery {
    bidItems(where: {slotStartBlock: ${startBlock}}, orderBy: amount, orderDirection: desc) {
      slotStartBlock
      relayer
      amount
      time
    }
  }
  `

  const { data }: { data: { bidItems: BidItem[] } } = useQuery(START_BLOCK)

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const TitleHeading = styled.p`
  font-size: 17px
  margin: 16px 0;
  font-weight:bold
`

  return (
    <>
      <Paper className={classes.paper}>
        <TitleHeading>
          Next Slot Start Block: {startBlock} Starting in (Countdown block):
        </TitleHeading>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <RelayTableHead
              classes={classes}
              rowCount={data && data.bidItems.length}
            />
            <TableBody>
              {data &&
                data.bidItems.map((bidItem: BidItem, index: number) => {
                  const localTIme = DateTime.fromMillis(+bidItem.time)
                    .toLocal()
                    .toFormat('ff')

                  const amount = new BN(bidItem.amount).div(1e18).toString()
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <TableRow
                      role="checkbox"
                      tabIndex={-1}
                      key={amount}
                      style={{
                        backgroundColor: index === 0 ? '#aff3d0' : 'white',
                      }}
                    >
                      <TableCell component="th" id={labelId} scope="row">
                        {Number(amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{bidItem.relayer}</TableCell>
                      <TableCell>{localTIme}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={data && data.bidItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}

export default BidTable
