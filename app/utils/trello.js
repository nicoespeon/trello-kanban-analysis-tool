import R from 'ramda';

const createActions = [
  'createCard',
  'copyCard',
  'moveCardToBoard',
  'convertToCardFromCheckItem',
];

const deleteActions = [
  'deleteCard',
  'moveCardFromBoard',
];

// getCreateList :: Action -> List
const getCreateList = R.converge(
  R.pathOr,
  [
    R.path(['data', 'list']),
    R.always(['data', 'listAfter']),
    R.identity,
  ]
);

// getDeleteList :: Action -> List
const getDeleteList = R.converge(
  R.pathOr,
  [
    R.path(['data', 'list']),
    R.always(['data', 'listBefore']),
    R.identity,
  ]
);

// getCreateActions :: [Action] -> [Action]
const getCreateActions = R.compose(
  R.map((action) => R.set(
    R.lensPath(['data', 'list']),
    getCreateList(action),
    action
  )),
  R.filter(
    R.either(
      R.propSatisfies(
        R.contains(R.__, createActions),
        'type'
      ),
      R.both(
        R.propEq('type', 'updateCard'),
        R.either(
          R.path(['data', 'listAfter']),
          R.compose(R.equals(false), R.path(['data', 'card', 'closed']))
        )
      )
    )
  )
);

// getDeleteActions :: [Action] -> [Action]
const getDeleteActions = R.compose(
  R.map((action) => R.set(
    R.lensPath(['data', 'list']),
    getDeleteList(action),
    action
  )),
  R.filter(
    R.either(
      R.propSatisfies(
        R.contains(R.__, deleteActions),
        'type'
      ),
      R.both(
        R.propEq('type', 'updateCard'),
        R.either(
          R.path(['data', 'listBefore']),
          R.compose(R.equals(true), R.path(['data', 'card', 'closed']))
        )
      )
    )
  )
);

// List = {id: String, name: String}
// getDisplayedLists :: [List] -> String -> String -> [List]
const getDisplayedLists = (lists, first, last) => {
  const names = R.pluck('name', lists);
  return R.slice(
    R.indexOf(first, names),
    R.indexOf(last, names) + 1 || R.length(lists),
    lists
  );
};

// Pattern for list names with WIP: "Production [3]" -> ["Production", " [3]"]
const parsedNamePattern = /(.*?)(\s\[\d+\])$/;

// parseListName :: String -> [String | Undefined]
const parseListName = R.cond([
  [
    R.test(parsedNamePattern),
    R.compose(R.head, R.tail, R.match(parsedNamePattern)),
  ],
  [R.T, R.identity],
]);

const getListNameFromId = R.curry((lists, id) => R.compose(
  parseListName,
  R.propOr('', 'name'),
  R.find(R.propEq('id', id))
)(lists));

export {
  getCreateList,
  getDeleteList,
  getCreateActions,
  getDeleteActions,
  getDisplayedLists,
  parseListName,
  getListNameFromId,
};
