import { Middleware } from '@curveball/kernel';
import { State } from './state.js';
import { stateToHal } from './hal.js';
import { NotAcceptable } from '@curveball/http-errors';

const formats = [
  'application/hal+json',
];

export function hateoasMw(): Middleware {

  return async(ctx, next) => {

    await next();
    if (!(ctx.response.body instanceof State)) {
      return;
    }

    const desiredFormat = ctx.accepts(...formats);

    switch(desiredFormat) {
      case 'application/hal+json' :
        ctx.response.type = 'application/hal+json';
        ctx.response.body = stateToHal(
          ctx.response.body,
          {
            defaultUri: ctx.request.requestTarget,
          }
        );
        break;
      default:
        throw new NotAcceptable('You must pass a valid Accept header for this endpoint. This endpoint supports the following: ' + formats.join(','));
    }

  };

}
