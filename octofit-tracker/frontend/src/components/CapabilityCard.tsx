import { ReactNode, useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = { title: string; description: string; path: string; emptyText: string; dataKey: string; children: (data: T[]) => ReactNode };
export function CapabilityCard<T>({ title, description, path, emptyText, dataKey, children }: Props<T>) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getJson<Record<string, T[]>>(path).then((result) => active && setData(result[dataKey] ?? [])).catch(() => active && setError(true));
    return () => { active = false; };
  }, [path, dataKey]);
  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{error ? <p role="alert">Unable to load {title.toLowerCase()}.</p> : data === null ? <p role="status">Loading {title.toLowerCase()}...</p> : data.length === 0 ? <p>{emptyText}</p> : children(data)}</div></section>;
}
