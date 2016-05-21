import R from 'ramda';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD';

// endOf :: Date -> Date
function endOf(month) {
  return moment(month)
    .date(moment(month, dateFormat).daysInMonth())
    .format(dateFormat);
}

// Dates

const lastMonth = moment()
  .month(moment().month() - 1)
  .date(1)
  .format(dateFormat);

const endOfLastMonth = endOf(lastMonth);

const currentMonth = moment().date(1).format(dateFormat);

const endOfMonth = endOf(currentMonth);

const today = moment().format(dateFormat);
const tomorrow = moment().add(1, 'day').format(dateFormat);

// parseDate :: String -> String
const parseDate = R.compose(R.head, R.split('T'));

// sortByDate :: [{date: String}] -> [{date: String}]
const sortByDate = R.sortBy(R.prop('date'));

// sortByDateDesc :: [{date: String}] -> [{date: String}]
const sortByDateDesc = R.compose(
  R.unary(R.reverse),
  sortByDate
);

// uniqByDateDesc :: [{date: String}] -> [{date: String}]
const uniqByDateDesc = R.compose(
  R.uniqBy(R.prop('date')),
  R.reverse
);

// nextDay :: String -> String
const nextDay = (date) => moment(date).add(1, 'days').format(dateFormat);

// withNextDay :: [{date: String}] -> [{date: String}]
const withNextDay = R.over(R.lensProp('date'), nextDay);

// wasPreviousDateOf :: [{date: String}] -> [{date: String}] -> Boolean
const wasPreviousDateOf = R.curry((a, b) => R.propEq(
  'date',
  nextDay(R.prop('date', b)),
  a
));

// Date = {date: String}
// scanMissingDate :: [{date: String|undefined}|[Date]] -> [Date] -> [Date|[Date]]
function scanMissingDate(a, b) {
  return R.compose(
    R.cond([
      [
        R.either(R.isEmpty, wasPreviousDateOf(b)),
        R.always(b),
      ],
      [
        R.T,
        (x) => [
          withNextDay(x),
          scanMissingDate(withNextDay(x), b),
        ],
      ],
    ]),
    R.last,
    R.flatten,
    R.concat([])
  )(a);
}

// fillMissingDates :: [{date: String}] -> [{date: String}]
const fillMissingDates = R.compose(
  R.tail,
  R.flatten,
  R.scan(scanMissingDate, {}),
  sortByDate
);

// filterByDate :: (String -> String -> Boolean) -> String -> [{date: String}] -> [{date: String}]
const filterByDate = R.curry((fn, date, items) => R.filter(
  R.propSatisfies(
    x => R.or(R.isNil(date), fn(x, date)),
    'date'
  ),
  items
));

// filterBeforeDate :: String -> [{date: String}] -> [{date: String}]
const filterBeforeDate = filterByDate(R.lt);

// filterAfterDate :: String -> [{date: String}] -> [{date: String}]
const filterAfterDate = filterByDate(R.gte);

// filterBetweenDates :: String -> String -> [{date: String}] -> [{date: String}]
const filterBetweenDates = R.curry((startDate, endDate, items) => R.compose(
  filterBeforeDate(endDate),
  filterAfterDate(startDate)
)(items));

// daysSpent :: Date -> Date -> Integer
const daysSpent = (
  start,
  end
) => moment(end).diff(moment(start), 'days');

export {
  lastMonth,
  endOfLastMonth,
  currentMonth,
  endOfMonth,
  today,
  tomorrow,

  parseDate,
  sortByDate,
  sortByDateDesc,
  uniqByDateDesc,
  nextDay,
  fillMissingDates,
  filterBeforeDate,
  filterAfterDate,
  filterBetweenDates,
  daysSpent,
};
