(function () {
  const SIDE = 30;
  const DELAY = 10;
  const GENERATORS_TABLE = {
    'prim' : mstPrimSleepy,
    'kruskal' : mstKruskalSleepy,
    'dijkstra' : dijkstra
  };
  const canvas = document.getElementById('canvas');
  let globalTimeout;

  document.getElementsByName('algo').forEach(element => element.onclick = generateAndDraw);

  generateAndDraw();

  function generateAndDraw() {
    if (globalTimeout)
      clearTimeout(globalTimeout);

    const canvasSide = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.9);
    canvas.width = canvasSide;
    canvas.height = canvasSide;

    const radio = document.querySelector('input[name="algo"]:checked');
    const generator = GENERATORS_TABLE[radio.value];
    if (!generator)
      return;

    const gridEdges = generateGrid(SIDE);
    const gridAdjacency = convertEdgesToGraph(gridEdges, SIDE);
    generator(gridEdges, gridAdjacency, SIDE);
  }

  function getVertex(side, i, j) {
    return side * i + j;
  }

  function getCoords(side, v) {
    return [Math.floor(v / side), v % side];
  }

  function generateGrid(side) {
    let edges = []
    for (let i = 0; i < side; ++i) {
      for (let j = 0; j < side; ++j) {
        if (i < side - 1)
          edges.push([getVertex(side, i, j), getVertex(side, i + 1, j), Math.random()]);
        if (j < side - 1)
          edges.push([getVertex(side, i, j), getVertex(side, i, j + 1), Math.random()]);
      }
    }
    return edges;
  }

  // 0 1 2 3  4  5  6  7   8   9   10  11  12  13  14
  // r l r ll lr rl rr lll llr lrl lrr rll rlr rrl rrr
  // children: (i + 1) * 2 - 1  and the next
  // parent: (i + 1) / 2 - 1

  function pushHeap(heap, x, cmp) {
    heap.push(x);
    let cur = heap.length - 1;
    let par = Math.floor((cur + 1) / 2) - 1;
    while (cur && cmp(heap[cur], heap[par])) {
      [heap[cur], heap[par]] = [heap[par], heap[cur]];
      cur = par;
      par = Math.floor((cur + 1) / 2) - 1;
    }
  }

  function popHeap(heap, cmp) {
    if (heap.length == 1)
      return heap.pop();
    let res = heap[0];
    heap[0] = heap.pop();
    let cur = 0;
    let child1 = (cur + 1) * 2 - 1;
    let child2 = child1 + 1;
    while (child1 < heap.length || child2 < heap.length) {
      if (cmp(heap[cur], heap[child1]) && (child2 >= heap.length || cmp(heap[cur], heap[child2]))) {
        break;
      }
      if (child2 >= heap.length || cmp(heap[child1], heap[child2])) {
        [heap[cur], heap[child1]] = [heap[child1], heap[cur]];
        cur = child1;
      } else {
        [heap[cur], heap[child2]] = [heap[child2], heap[cur]];
        cur = child2;
      }
      child1 = (cur + 1) * 2 - 1;
      child2 = child1 + 1;
    }
    return res;
  }

  function convertEdgesToGraph(edges, side) {
    let graph = [];
    for (let i = 0; i < side * side; ++i)
      graph.push([]);
    edges.forEach(edge => {
      let [l, r, w] = edge;
      graph[r].push([l, w]);
      graph[l].push([r, w]);
    });
    return graph;
  }

  function dijkstra(edges, graph, side) {
    const cmp = (l, r) => l[2] <= r[2];
    const vertexCount = side * side;
    let cur = Math.round((vertexCount - 1) * Math.random());
    let heap = [];

    let INF = 1000 * vertexCount;
    let distances = [];
    let processed = [];
    for (let i = 0; i < vertexCount; ++i) {
      distances.push(INF);
      processed.push(0);
    }

    processed[cur] = 1;
    distances[cur] = 0;
    graph[cur].forEach(edge => {
      let [v, w] = edge;
      let dist = distances[cur] + w;
      if (dist < distances[v]) {
        distances[v] = dist;
        pushHeap(heap, [cur, v, w], cmp)
      }
    });

    let resEdges = [];
    function nextEdge() {
      let edge = popHeap(heap, cmp);
      while (heap.length && processed[edge[1]]) {
        edge = popHeap(heap, cmp);
      }
      if (!heap.length)
        return;
      cur = edge[1];
      processed[cur] = 1;
      resEdges.push(edge);
      graph[cur].forEach(edge => {
        let [v, w] = edge;
        let dist = distances[cur] + w;
        if (dist < distances[v]) {
          distances[v] = dist;
          pushHeap(heap, [cur, v, w], cmp)
        }
      });
      drawGrid(canvas, resEdges, side);
      if (heap.length)
        globalTimeout = setTimeout(nextEdge, DELAY);
    }
    nextEdge();
  }

  function mstPrimSleepy(edges, graph, side) {
    const cmp = (l, r) => l[2] <= r[2];
    const vertexCount = side * side;

    let cur = Math.round((vertexCount - 1) * Math.random());
    let heap = [];

    let visited = []
    for (let i = 0; i < vertexCount; ++i)
      visited.push(0);

    visited[cur] = 1;
    graph[cur].forEach(edge => pushHeap(heap, [cur, edge[0], edge[1]], cmp));

    let mstEdges = []
    let remaining = vertexCount - 1;
    function nextEdge() {
      let edge = popHeap(heap, cmp);
      while (visited[edge[1]]) {
        edge = popHeap(heap, cmp);
      }
      cur = edge[1];
      visited[cur] = 1;
      mstEdges.push(edge);
      graph[cur].forEach(edge => {
        if (!visited[edge[0]])
          pushHeap(heap, [cur, edge[0], edge[1]], cmp);
      });
      drawGrid(canvas, mstEdges, side);
      --remaining;
      if (remaining)
        globalTimeout = setTimeout(nextEdge, DELAY);
    }
    nextEdge();
  }

  function union(pointers, lengths, l, r) {
    l = find(pointers, lengths, l);
    r = find(pointers, lengths, r);
    if (lengths[l] > lengths[r])
      [l, r] = [r, l];
    pointers[l] = r;
    lengths[r] += lengths[l];
  }

  function find(pointers, lengths, x) {
    while (pointers[x] != x)
      x = pointers[x];
    return x;
  }

  function mstKruskalSleepy(edges, graph, side) {
    edges.sort((x, y) => x[2] - y[2]);
    let edgeIndex = 0;
    let mstEdges = [];
    let pointers = [];
    let lengths = [];
    const vertexCount = side * side;
    for (let i = 0; i < vertexCount; ++i) {
      pointers.push(i);
      lengths.push(1);
    }

    let remaining = vertexCount - 1;
    function nextEdge() {
      let [l, r, w] = edges[edgeIndex];
      while (find(pointers, lengths, l) == find(pointers, lengths, r)) {
        ++edgeIndex;
        [l, r, w] = edges[edgeIndex];
      }
      mstEdges.push([l, r, w]);
      union(pointers, lengths, l, r);
      ++edgeIndex;
      drawGrid(canvas, mstEdges, side);
      --remaining;
      if (remaining)
        globalTimeout = setTimeout(nextEdge, DELAY);
    }
    nextEdge();
  }

  function drawGrid(canvas, edges, side) {
    let ctx = canvas.getContext('2d');
    let w = canvas.width;
    let h = canvas.height;

    let cellWidth = w / side;
    let cellHeight = h / side;
    let centerOffsetX = cellWidth / 2;
    let centerOffsetY = cellHeight / 2;
    let rectHalfWidth = cellWidth / 4;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 20, 200, 1)';

    for (let x = centerOffsetX; x < w; x += cellWidth) {
      for (let y = centerOffsetY; y < h; y += cellHeight) {
        ctx.fillRect(x - rectHalfWidth, y - rectHalfWidth, 2 * rectHalfWidth, 2 * rectHalfWidth);
      }
    }

    edges.forEach(edge => {
      const [lx, ly] = getCoords(side, edge[0]);
      const [rx, ry] = getCoords(side, edge[1]);
      const isVertical = lx === rx;
      const x = lx * cellWidth + centerOffsetX - (isVertical ? rectHalfWidth : 0);
      const y = ly * cellHeight + centerOffsetY - (isVertical ? 0 : rectHalfWidth);
      const rectWidth = isVertical ? 2 * rectHalfWidth : (rx - lx) * cellWidth;
      const rectHeight = isVertical ? (ry - ly) * cellHeight : 2 * rectHalfWidth;

      ctx.fillRect(x, y, rectWidth, rectHeight);
    });
    ctx.restore();
  }
})();
