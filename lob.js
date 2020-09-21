class LOB {
  constructor () {
    this.asks = [];
    this.bids = [];
  }

  insert (orderId, quantity, price, side) {
    console.log('Inserting order:', orderId, quantity, price, side);
    let residual = quantity;
    const nanotime = process.hrtime();
    const ts = nanotime[0] * 10**9 + nanotime[1];
    switch (side) {
      case 'bid': {
        while (this.asks.length && this.asks[0] && residual > 0 && price >= this.asks[0].price) {
          residual = this.process(this.asks, residual);
        }
        if (residual > 0) {
          this.bids.unshift({ orderId, quantity: Number(residual.toFixed(2)), price, ts });
          this.bids.sort((a, b) => a.price === b.price ? a.ts - b.ts : b.price - a.price);
        }
        break;
      }
      case 'ask': {
        while (this.bids.length && this.bids[0] && residual > 0 && price <= this.bids[0].price) {
          residual = this.process(this.bids, residual);
        }
        if (residual > 0) {
          this.asks.unshift({ orderId, quantity: Number(residual.toFixed(2)), price, ts });
          this.asks.sort((a, b) => a.price === b.price ? a.ts - b.ts : a.price - b.price);
        }
        break;
      }
      default: {
        throw new Error(`side: ${side} does not defined`);
      }
    }
  }

  process (orders, residual) {
    if (residual < orders[0].quantity) {
      orders[0].quantity = Number((orders[0].quantity - residual).toFixed(2));
      residual = 0;
    } else {
      residual -= orders[0].quantity;
      orders.shift();
    }

    return residual;
  }
  cancel (orderId) {
    const askOrderIndex = this.asks.findIndex(order => order.orderId === orderId);
    if (askOrderIndex !== -1) {
      delete this.asks[askOrderIndex];
      return;
    }

    const bidOrderIndex = this.asks.findIndex(order => order.orderId === orderId);
    if (bidOrderIndex !== -1) {
      delete this.bids[bidOrderIndex];
      return;
    }
  }
  print () {
    console.log('Limit order book:', this);
  }
}

function generateId (length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

function main () {
  const lob = new LOB();
  for (let i = 0; i < 10; i++) {
    const side = Math.round(Math.random()) ? 'bid' : 'ask';
    const price = Math.round(Math.random() * 100);
    const quantity = Number(Math.random().toFixed(2));
    const orderId = generateId(5);
    lob.insert(orderId, quantity, price, side);
  }
}

main();
