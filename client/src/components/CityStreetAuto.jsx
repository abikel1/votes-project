import { useEffect, useMemo, useRef, useState } from "react";

const CKAN_BASE = "https://data.gov.il/api/3/action/datastore_search";
const CITIES_RID = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";
const STREETS_RID = "a7296d1a-f8c9-4b70-96c2-6ebb4352f8e3";

function norm(s = "") { return String(s).trim().replace(/[״"׳'()]/g, "").replace(/\s+/g, " ").toLowerCase(); }
const unique = (arr) => [...new Set(arr)].filter(Boolean);
function useDebounce(fn, ms = 250) { return useMemo(() => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) }; }, [fn, ms]); }

function BlockCubeInput({ children }) {
  return (
    <div className="control block-cube block-input" style={{ position: 'relative' }}>
      {children}
      <div className="bg-top"><div className="bg-inner" /></div>
      <div className="bg-right"><div className="bg-inner" /></div>
      <div className="bg"><div className="bg-inner" /></div>
    </div>
  );
}

export default function CityStreetAuto({
  idPrefix = "cs",
  className = "",
  variant = "plain",
  city,
  address,
  onCityChange,
  onAddressChange,
  cityError,
  addressError,
  maxSuggestions = 20,
  cityInputProps = {},
  streetInputProps = {},
  // ✅ חדשים:
  onlyCity = false,
  onlyStreet = false,
}) {

  const [cityInput, setCityInput] = useState(city || "");
  const [streetInput, setStreetInput] = useState(address || "");

  const [allCities, setAllCities] = useState([]);     // [{name, code}]
  const [cityNames, setCityNames] = useState([]);     // ["תל אביב-יפו", ...]
  const [cities, setCities] = useState([]);
  const [allStreets, setAllStreets] = useState([]);
  const [streets, setStreets] = useState([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingStreets, setLoadingStreets] = useState(false);

  const lastCityRequestedRef = useRef("");
  const cityLoadedRef = useRef("");
  const selectedCityCodeRef = useRef(null);

  // --- load cities (paginated) ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCities(true);
        const page = 1000; let offset = 0; const all = [];
        while (true) {
          const params = new URLSearchParams({ resource_id: CITIES_RID, limit: String(page), offset: String(offset), sort: "שם_ישוב asc" });
          const r = await fetch(`${CKAN_BASE}?${params.toString()}`); if (!r.ok) break;
          const j = await r.json(); const recs = j?.result?.records || []; const total = j?.result?.total ?? recs.length;
          for (const rec of recs) { const name = (rec["שם_ישוב"] || "").trim(); const code = rec["סמל_ישוב"]; if (name && code != null) all.push({ name, code }); }
          offset += page; if (offset >= total || recs.length === 0) break;
        }
        if (!cancelled) {
          const dedup = Array.from(new Map(all.map(c => [c.name, c])).values());
          setAllCities(dedup);
          const names = dedup.map(c => c.name);
          setCityNames(names);
          setCities(names.slice(0, maxSuggestions));
        }
      } finally { if (!cancelled) setLoadingCities(false); }
    })();
    return () => { cancelled = true };
  }, [maxSuggestions]);

  // --- filter cities locally ---
  const filterCities = useDebounce((term) => {
    const t = norm(term);
    if (!t) { setCities(cityNames.slice(0, maxSuggestions)); return; }
    const starts = cityNames.filter(c => norm(c).startsWith(t));
    const rest = cityNames.filter(c => !norm(c).startsWith(t) && norm(c).includes(t));
    setCities([...starts, ...rest].slice(0, maxSuggestions));
  }, 150);

  // --- load streets by city code (paginated) ---
  const loadStreetsForCityCode = async (cityCode) => {
    if (cityCode == null) { setAllStreets([]); setStreets([]); return; }
    lastCityRequestedRef.current = String(cityCode);
    setLoadingStreets(true);
    try {
      const page = 2000; let offset = 0; let all = [];
      while (true) {
        const params = new URLSearchParams({ resource_id: STREETS_RID, filters: JSON.stringify({ "סמל_ישוב": cityCode }), limit: String(page), offset: String(offset) });
        const r = await fetch(`${CKAN_BASE}?${params.toString()}`); if (!r.ok) break;
        const j = await r.json(); const recs = j?.result?.records || []; const total = j?.result?.total ?? recs.length;
        all = all.concat(recs.map(rec => (rec["שם_רחוב"] || "").trim()).filter(Boolean));
        offset += page; if (offset >= total || recs.length === 0) break;
      }
      if (lastCityRequestedRef.current !== String(cityCode)) return;
      const dedup = [...new Set(all)];
      setAllStreets(dedup);
      setStreets(dedup.slice(0, maxSuggestions));
      cityLoadedRef.current = String(cityCode);
    } finally { setLoadingStreets(false); }
  };

  // --- filter streets locally ---
  const filterStreets = useDebounce((term) => {
    const t = norm(term);
    if (!t) { setStreets(allStreets.slice(0, maxSuggestions)); return; }
    const starts = allStreets.filter(s => norm(s).startsWith(t));
    const rest = allStreets.filter(s => !norm(s).startsWith(t) && norm(s).includes(t));
    setStreets([...starts, ...rest].slice(0, maxSuggestions));
  }, 150);

  // sync props
  useEffect(() => setCityInput(city || ""), [city]);
  useEffect(() => setStreetInput(address || ""), [address]);

  // live filtering
  useEffect(() => { filterCities(cityInput); }, [cityInput, cityNames]);

  // exact city match
  const exactCityObj = useMemo(() => {
    const vTrim = (cityInput ?? "").trim();
    return allCities.find(c => c.name === vTrim) || null;
  }, [allCities, cityInput]);
  const isExactCity = !!exactCityObj;

  // load streets when exact city selected
  useEffect(() => {
    if (!isExactCity) { setAllStreets([]); setStreets([]); cityLoadedRef.current = ""; selectedCityCodeRef.current = null; return; }
    const code = exactCityObj.code; selectedCityCodeRef.current = code;
    if (cityLoadedRef.current !== String(code)) loadStreetsForCityCode(code);
  }, [isExactCity, exactCityObj]);

  const pickCity = (val) => {
    const v = (val ?? ""); setCityInput(v); onCityChange?.(v); setStreetInput(""); onAddressChange?.("");
    const match = allCities.find(c => c.name === v.trim());
    if (match) { selectedCityCodeRef.current = match.code; loadStreetsForCityCode(match.code); }
    else { selectedCityCodeRef.current = null; setAllStreets([]); setStreets([]); }
  };
  const pickStreet = (val) => { const v = (val ?? ""); setStreetInput(v); onAddressChange?.(v); };

  useEffect(() => { filterStreets(streetInput); }, [streetInput, allStreets]);

  useEffect(() => {
    if (!String(cityInput).trim() && cityNames.length) setCities(cityNames.slice(0, maxSuggestions));
    if (!String(streetInput).trim() && allStreets.length) setStreets(allStreets.slice(0, maxSuggestions));
  }, [cityNames, allStreets, cityInput, streetInput, maxSuggestions]);

  // ---- RENDER ----
  const CityInput = (
    <input
      list={`${idPrefix}-cities`}
      value={cityInput}
      onChange={(e) => pickCity(e.target.value)}
      placeholder="*עיר"
      {...cityInputProps}
    />
  );
  const StreetInput = (
    <input
      list={`${idPrefix}-streets`}
      value={streetInput}
      onChange={(e) => pickStreet(e.target.value)}
      placeholder={isExactCity ? "*כתובת / רחוב" : "בחרי עיר מהרשימה"}
      disabled={!isExactCity}
      {...streetInputProps}
    />
  );

  return (
    <div className={className}>
      {variant === "blockCube" ? (
        <>
          {/* עיר */}
          {!onlyStreet && (
            <>
              <BlockCubeInput>{CityInput}</BlockCubeInput>
              <datalist id={`${idPrefix}-cities`}>
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </>
          )}

          {/* רחוב */}
          {!onlyCity && (
            <>
              <BlockCubeInput>{StreetInput}</BlockCubeInput>
              <datalist id={`${idPrefix}-streets`}>
                {streets.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </>
          )}
        </>
      ) : (
        <>
          {/* עיר */}
          {!onlyStreet && (
            <>
              {CityInput}
              <datalist id={`${idPrefix}-cities`}>
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </>
          )}

          {/* רחוב */}
          {!onlyCity && (
            <>
              {StreetInput}
              <datalist id={`${idPrefix}-streets`}>
                {streets.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </>
          )}
        </>
      )}
    </div>
  );
}
