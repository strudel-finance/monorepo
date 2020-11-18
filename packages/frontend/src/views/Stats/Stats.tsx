import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import showError, { handleErrors } from '../../utils/showError'
import BN from 'bignumber.js'
import RollbarErrorTracking from '../../errorTracking/rollbar'
import Page from '../../components/Page'
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

interface TableHeadProps {
  classes: Object
  rowCount: number
}

const StatsTableHead: React.FC<TableHeadProps> = (props) => {
  const classes = useStyles()
  const headCells = [
    {
      id: 'Address',
      numeric: false,
      disablePadding: false,
      label: 'Address',
    },
    { id: 'Holdings', numeric: true, disablePadding: false, label: 'Holdings' },
    { id: 'Symbol', numeric: false, disablePadding: false, label: 'Symbol' },
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

interface RowItem {
  address: string
  balance: string
  token: string
  decimals: number
}

interface EthPlorerResponse {
  holders: [
    {
      address: string
      balance: string
      share: string
    },
  ]
}

interface StatsTableProp {
  rows: RowItem[]
}

const StatsTable: React.FC<StatsTableProp> = ({ rows }) => {
  const classes = useStyles()
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const TitleHeading = styled.p`
    font-size: 17px;
    margin: 20px 0;
    font-weight: bold;
  `
  const mapAddressToService = (
    address: string,
  ): { link: string; service: string } => {
    const lookUp = {
      '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4': {
        link: 'https://compound.finance/',
        service: 'Compound Wrapped BTC',
      },
      '0xbf72da2bd84c5170618fbe5914b0eca9638d5eb5': {
        link: 'https://oasis.app/borrow',
        service: 'Maker: WBTC',
      },
      '0x3dfd23a6c5e8bbcfc9581d2e864a68feb6a076d3': {
        link: 'https://app.aave.com/',
        service: 'Aave: Lending Pool',
      },
      '0x93054188d876f558f4a66b2ef1d97d16edf0895b': {
        link: 'https://www.curve.fi/ren/',
        service: 'Curve.fi: REN Swap',
      },
      '0xbb2b8038a1640196fbe3e38816f3e67cba72d940': {
        link:
          'https://info.uniswap.org/pair/0xbb2b8038a1640196fbe3e38816f3e67cba72d940',
        service: 'UniSwap V2: WBTC',
      },
      '0xceff51756c56ceffca006cd410b03ffc46dd3a58': {
        link:
          'https://sushiswap.vision/pair/0xceff51756c56ceffca006cd410b03ffc46dd3a58',
        service: 'SushiSwap: WBTC',
      },
      '0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714': {
        link: 'https://www.curve.fi/sbtc',
        service: 'Curve.fi: sBTC',
      },
      '0x65b0bf8ee4947edd2a500d74e50a3d757dc79de0': {
        link: 'https://nexo.io/borrow',
        service: 'Nexo: WBTC Merchant Deposit',
      },
      '0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5': {
        link:
          'https://pools.balancer.exchange/#/pool/0x1eff8af5d577060ba4ac8a29a13525bb0ee2a3d5',
        service: 'Balancer: ETH/WBTC 50/50',
      },
      '0x20dd9e22d22dd0a6ef74a520cb08303b5fad5de7': {
        link: 'https://www.hegic.co/',
        service: 'Hegic: WBTC',
      },
      '0xc25099792e9349c7dd09759744ea681c7de2cb66': {
        link: 'https://www.curve.fi/tbtc',
        service: 'Curve.fi: tBTC',
      },
      '0xabbee9fc7a882499162323eeb7bf6614193312e3': {
        link:
          'https://tools.umaproject.org/?address=0xaBBee9fC7a882499162323EEB7BF6614193312e3',
        service: 'UMA: uUSDrBTC',
      },
      '0x53463cd0b074e5fdafc55dce7b1c82adf1a43b2e': {
        link: 'https://app.keeperdao.com/',
        service: 'KeeperDAO',
      },
    }
    if (address in lookUp) {
      return lookUp[address]
    } else {
      return {
        link: `https://etherscan.io/address/${address}`,
        service: address,
      }
    }
  }
  return (
    <>
      <TitleHeading>Biggest Tokenized Bitcoin Holders </TitleHeading>
      <Paper className={classes.paper}>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <StatsTableHead classes={classes} rowCount={rows && rows.length} />
            <TableBody>
              {rows &&
                (rowsPerPage > 0
                  ? rows.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage,
                    )
                  : rows
                ).map((rowItem: RowItem, index: number) => {
                  const amount = new BN(rowItem.balance)
                    .div(rowItem.decimals)
                    .toString()
                  const labelId = `enhanced-table-checkbox-${index}`
                  const { link, service } = mapAddressToService(rowItem.address)
                  return (
                    <TableRow
                      role="checkbox"
                      tabIndex={-1}
                      key={index}
                      style={{
                        backgroundColor: 'white',
                      }}
                    >
                      <TableCell>
                        <a href={link} target="_blank">
                          {service}
                        </a>
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row">
                        {Number(amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{rowItem.token}</TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10]}
          component="div"
          count={rows && rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}

const Stats: React.FC = () => {
  const StatsContainer = styled.div`
    width: 80% !important;
    @media (min-width: 500px) and (orientation: landscape) {
      padding: 0px 24px;
    }
    max-width: 1200px;
    box-sizing: border-box;
  `
  const [rows, setRows] = useState([])

  const getData = async () => {
    let tempRows: RowItem[] = []
    let tokens = [
      {
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        symbol: 'WBTC',
        decimal: 1e8,
      },
      {
        address: '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa',
        symbol: 'TBTC',
        decimal: 1e18,
      },
      {
        address: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
        symbol: 'renBTC',
        decimal: 1e8,
      },
      {
        address: '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
        symbol: 'sBTC',
        decimal: 1e18,
      },
    ]

    for (let i in tokens) {
      let res = await fetch(
        `https://api.ethplorer.io/getTopTokenHolders/${tokens[i].address}?apiKey=freekey&limit=25`,
      )
        .then(handleErrors)
        .then((response) => response.json())
        .then((res: EthPlorerResponse) => res)
        .catch((e) => {
          showError('Problem fetching stats: ' + e.message)
          RollbarErrorTracking.logErrorInRollbar(
            'Problem fetching stats: ' + e.message,
          )
          return undefined
        })

      if (res === undefined) {
        return
      }
      for (let y in res.holders) {
        if (
          new BN(res.holders[y].balance)
            .div(tokens[i].decimal)
            .isGreaterThan(new BN(50))
        ) {
          tempRows.push({
            address: res.holders[y].address,
            balance: res.holders[y].balance,
            token: tokens[i].symbol,
            decimals: tokens[i].decimal,
          })
        }
      }
    }
    const compare = (a: RowItem, b: RowItem) => {
      let amountA = new BN(a.balance).div(a.decimals)
      let amountB = new BN(b.balance).div(b.decimals)

      if (amountA.isLessThan(amountB)) {
        return 1
      }
      if (amountA.isGreaterThan(amountB)) {
        return -1
      }
      return 0
    }

    tempRows.sort(compare)
    setRows(tempRows)
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <Page>
      <StatsContainer>
        <StatsTable rows={rows} />
      </StatsContainer>
    </Page>
  )
}

export default Stats
