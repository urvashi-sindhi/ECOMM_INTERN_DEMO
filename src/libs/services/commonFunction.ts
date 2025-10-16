export async function pagination(
  model: any,
  page: number = 1,
  pageSize: number = 10,
  options: any = {},
  dataKey: string = 'data',
) {
  const safePageSize = pageSize || 10;
  const offset = (page - 1) * safePageSize;

  options.limit = safePageSize;
  options.offset = offset;

  let result = await model.findAndCountAll(options);

  if (!result) {
    return {
      [dataKey]: [],
      totalItems: 0,
      totalPage: 1,
      currentPage: page,
      pageSize: safePageSize,
      numberOfRows: 0,
    };
  }

  return {
    [dataKey]: result.rows ?? [],
    totalItems: result.count ?? 0,
    totalPage: Math.ceil(result.count / safePageSize),
    currentPage: page,
    pageSize: safePageSize,
    numberOfRows: result.rows?.length ?? 0,
  };
}

export function sorting(sortKey: string, sortValue: string) {
  const sortQuery: [string, string][] = [];

  if (sortKey && sortValue) {
    if (sortValue === 'asc' || sortValue === 'desc') {
      sortQuery.push([sortKey, sortValue.toUpperCase()]);
    }
  } else {
    sortQuery.push(['id', 'desc']);
  }
  return sortQuery;
}
