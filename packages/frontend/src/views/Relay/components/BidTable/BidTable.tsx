import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import {
  FormControlLabel,
  makeStyles,
  Paper,
  Switch,
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
import * as luxon from 'luxon'
import './BidTable.css'

interface RelayTableHeadProps {
  classes: Object
  numSelected: number
  onRequestSort: (event: any, property: any) => void
  order: 'asc' | 'desc' | string
  orderBy: string
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
    { id: 'Time', numeric: true, disablePadding: false, label: 'Time (Local)' },
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
  const [order, setOrder] = React.useState('asc')
  const [orderBy, setOrderBy] = React.useState('calories')
  const [selected, setSelected] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [dense, setDense] = React.useState(false)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const [TableData, setTableData] = useState()

  const LATEST_ROUND = gql`
    query getLatesRound(
      $first: Number!
      $startBlock: Number!
      $orderDirection: Number!
    ) {
      rounds(first: 1, orderBy: startBlock, orderDirection: desc) {
        startBlock
        slotWinner
        betAmount
      }
    }
  `

  const START_BLOCK = gql`
    query StartBlockQuery {
      bidItems(slotStartBlock: ${startBlock}, orderBy: amount, orderDirection: desc) {
        slotStartBlock
        relayer
        amount
        time
      }
    }
  `

  const { data }: { data: { bidItems: BidItem[] } } = useQuery(START_BLOCK)

  console.log(data, 'data')

  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <div
      className={classes.root}
      style={{
        width: '80%',
        padding: `0 24px`,
        maxWidth: '1200px',
        boxSizing: 'border-box',
      }}
    >
      <Paper className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <RelayTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={data && data.bidItems.length}
            />
            <TableBody>
              {data &&
                data.bidItems.map((bidItem: BidItem, index: number) => {
                  console.log(
                    new Date(+bidItem.time).toISOString(),
                    luxon.DateTime.fromMillis(+bidItem.time)
                      .toLocal()
                      .toFormat('ff'),
                    'rrrrr',
                  )

                  const localTIme = luxon.DateTime.fromMillis(+bidItem.time)
                    .toLocal()
                    .toFormat('ff')

                  const amount = new BN(bidItem.amount).div(1e18).toString()
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <TableRow
                      role="checkbox"
                      tabIndex={-1}
                      key={amount}
                      className={index === 0 && 'leader'}
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
    </div>
  )
}

export default BidTable
