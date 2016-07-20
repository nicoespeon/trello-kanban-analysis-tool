import R from 'ramda';
import { Observable } from 'rx';

import { argsToArray } from '../utils/function';

const actionsFilter = [
  'createCard',
  'deleteCard',
  'updateCard:idList',
  'updateCard:closed',
  'copyCard',
  'moveCardFromBoard',
  'moveCardToBoard',
  'convertToCardFromCheckItem',
].join(',');
const actionsFields = 'data,date,type';

function createAuthorize$(appName, input$) {
  return Observable.create((observer) => {
    input$
    .filter(R.propEq('type', 'authorize'))
    .subscribe(({ interactive = true }) => {
      Trello.authorize({
        type: 'popup',
        interactive,
        name: appName,
        scope: { read: true },
        persist: true,
        expiration: 'never',
        success: () => {
          observer.onNext();
          observer.onCompleted();
        },
        error: (error) => R.when(
          R.identity,
          observer.onError.bind(observer, error)
        )(interactive),
      });
    });
  });
}

function createBoards$(input$) {
  return Observable.create((observer) => {
    input$
      .filter(R.propEq('type', 'getBoards'))
      .subscribe(() => {
        Trello.get(
          '/members/me/boards',
          {
            filter: 'open',
            fields: 'name,shortLink',
          },
          (data) => {
            observer.onNext(data);
            observer.onCompleted();
          },
          observer.onError.bind(observer)
        );
      });
  });
}

function createActions$(input$) {
  return Observable.create((observer) => {
    input$
      .filter(R.propEq('type', 'fetch'))
      .subscribe(({ boardId }) => {
        Trello.get(
          `/boards/${boardId}/actions`,
          {
            filter: actionsFilter,
            fields: actionsFields,
            limit: 1000,
          },
          observer.onNext.bind(observer),
          observer.onError.bind(observer)
        );
      });
  });
}

function createLists$(input$) {
  return Observable.create((observer) => {
    input$
      .filter(R.propEq('type', 'fetch'))
      .subscribe(({ boardId }) => {
        Trello.get(
          `/boards/${boardId}/lists`,
          {
            fields: 'name',
            cards: 'open',
            card_fields: '',
          },
          observer.onNext.bind(observer),
          observer.onError.bind(observer)
        );
      });
  });
}

// cardActions$ :: String -> Observable
function cardActions$(cardId) {
  return Observable.create((observer) => {
    Trello.get(
      `/cards/${cardId}/actions`,
      {
        filter: actionsFilter,
        limit: 1000,
        fields: actionsFields,
        memberCreator: false,
      },
      (data) => {
        observer.onNext(data);
        observer.onCompleted();
      },
      observer.onError.bind(observer)
    );
  });
}

function createCardsActions$$(input$) {
  return Observable.create((observer) => {
    input$
      .filter(R.propEq('type', 'fetchMissing'))
      .map(R.prop('cardIds'))
      .filter(R.compose(R.not, R.isEmpty))
      .subscribe((cardIds) => {
        observer.onNext(
          Observable.zip.apply(
            null,
            cardIds
              .map(cardActions$)
              .concat(argsToArray)
          )
        );
      });
  });
}

function trelloSinkDriver(input$) {
  const appName = 'Trello Kanban Analysis Tool';

  const factories = {
    authorize: createAuthorize$(appName, input$).publish(),
    boards: createBoards$(input$),
    actions: createActions$(input$).publish(),
    lists: createLists$(input$).publish(),
    cardsActions: createCardsActions$$(input$).publish(),
  };

  // Connect hot observables so they start emitting.
  factories.authorize.connect();
  factories.actions.connect();
  factories.lists.connect();
  factories.cardsActions.connect();

  return {
    get(type) {
      return factories[type];
    },
  };
}

export { trelloSinkDriver };
