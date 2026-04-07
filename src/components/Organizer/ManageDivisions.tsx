import { getTournamentRegistrations } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  Column,
  RowSelectionState,
  Table
  , getSortedRowModel 
} from "@tanstack/react-table";
import type {SortingState} from "@tanstack/react-table";

// import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { selectedRegistrationsAtom, type DrawRegistration } from "@/store/selectedRegistrations";
import { useNavigate } from "@tanstack/react-router";
import { CheckboxFilter } from "../Custom/CheckboxFilter";
//import { CheckboxFilterPopover } from "../Custom/CheckBoxFilterPopover";
import { Filter as FilterIcon, FilterX, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Pill } from "../Custom/Pill";

// import { isBeltColor } from "@/datatypes/belt-colors";
import  { BeltColor,isBeltColor } from "@/datatypes/belt-colors";
import { DebouncedInput } from "../Custom/DebouncedInput";
import { ReactSelectMulti } from "../Custom/ReactSelectMulti";
// import { PillButton } from "../Custom/PillButton";
import { normalizeName } from "@/helpers/stringHelpers";
import { rankItem } from '@tanstack/match-sorter-utils';
import type { FilterFn } from '@tanstack/react-table';
import { IndeterminateCheckbox, PillButton, SegmentedButton } from "@/components/Custom/";


export type RegistrationRow = {
  id: number
  registrationId: number
  firstName: string
  lastName: string
  participantGender: string
  participantRank: string
  participantRankOrder: number
  isPaid: boolean
  checkedIn: boolean

  divisionGender: string
  divisionName: string
  divisionRank: string
  divisionBeltOrder: number
  minAge: number
  maxAge: number | null
  eventDisplayName: string  
  eventName: string
}

export type ManageDivisionsSearch = {
  fullName?: string
  eventDisplayName?: string[]
  divisionName?: string[]
  eventName?: string[]
  participantRank?: string[]
  participantGender?: string[]
  checkedIn?: boolean[]
  isPaid?: boolean[]
}

const FILTER_IDS = [
  "fullName",
  "eventDisplayName",
  "divisionName",
  "eventName",
  "participantRank",
  "participantGender",
  "checkedIn",
  "isPaid",
] as const

type FilterId = (typeof FILTER_IDS)[number]

const isSameArray = <T,>(left: T[] | undefined, right: T[] | undefined) => {
  if (!left && !right) return true
  if (!left || !right) return false
  if (left.length !== right.length) return false

  return left.every((value, index) => value === right[index])
}

const isSameSearch = (left: ManageDivisionsSearch, right: ManageDivisionsSearch) => (
  left.fullName === right.fullName
  && isSameArray(left.eventDisplayName, right.eventDisplayName)
  && isSameArray(left.divisionName, right.divisionName)
  && isSameArray(left.eventName, right.eventName)
  && isSameArray(left.participantRank, right.participantRank)
  && isSameArray(left.participantGender, right.participantGender)
  && isSameArray(left.checkedIn, right.checkedIn)
  && isSameArray(left.isPaid, right.isPaid)
)

const buildColumnFiltersFromSearch = (search: ManageDivisionsSearch): ColumnFiltersState => {
  const filters: ColumnFiltersState = []

  if (search.fullName) {
    filters.push({ id: "fullName", value: search.fullName })
  }

  for (const id of FILTER_IDS) {
    if (id === "fullName") continue

    const value = search[id]
    if (Array.isArray(value) && value.length > 0) {
      filters.push({ id, value })
    }
  }

  return filters
}

const buildSearchFromColumnFilters = (columnFilters: ColumnFiltersState): ManageDivisionsSearch => {
  const search: ManageDivisionsSearch = {}

  for (const filter of columnFilters) {
    if (!FILTER_IDS.includes(filter.id as FilterId)) {
      continue
    }

    if (filter.id === "fullName") {
      const value = typeof filter.value === "string" ? filter.value.trim() : ""
      if (value) {
        search.fullName = value
      }
      continue
    }

    if (Array.isArray(filter.value) && filter.value.length > 0) {
      ;(search as Record<string, unknown>)[filter.id] = filter.value
    }
  }

  return search
}

const buildRowSelectionFromRegistrations = (registrations: DrawRegistration[]): RowSelectionState => {
  const rowSelection: RowSelectionState = {}

  for (const registration of registrations) {
    rowSelection[String(registration.registrationId)] = true
  }

  return rowSelection
}

const eventNumberCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
})

const textCollator = new Intl.Collator(undefined, {
  sensitivity: "base",
})

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function buildSelectedListPrintDocumentMarkup(
  registrations: DrawRegistration[],
  tournamentId: number,
) {
  const sortedRegistrations = [...registrations].sort((left, right) => {
    const leftEvent = left.eventDisplayName || left.eventName || ""
    const rightEvent = right.eventDisplayName || right.eventName || ""
    const eventCompare = eventNumberCollator.compare(leftEvent, rightEvent)

    if (eventCompare !== 0) {
      return eventCompare
    }

    const lastNameCompare = textCollator.compare(left.lastName, right.lastName)
    if (lastNameCompare !== 0) {
      return lastNameCompare
    }

    return textCollator.compare(left.firstName, right.firstName)
  })

  const rowsMarkup = sortedRegistrations
    .map((registration) => {
      const fullName = `${registration.firstName} ${registration.lastName}`
      const eventNumber = registration.eventDisplayName || registration.eventName || ""

      return `<tr>
        <td>${escapeHtml(fullName)}</td>
        <td>${escapeHtml(eventNumber)}</td>
        <td>${escapeHtml(registration.participantRank)}</td>
        <td class="checkbox-cell"><span class="checkbox-box"></span></td>
      </tr>`
    })
    .join("")

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Selected Registration List</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.5in;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #f3f4f6;
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
              "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            padding: 24px;
            box-sizing: border-box;
          }

          .print-preview-toolbar {
            position: fixed;
            top: 16px;
            right: 16px;
            display: flex;
            gap: 12px;
            z-index: 10;
          }

          .print-preview-toolbar button {
            border: 1px solid #111827;
            background: white;
            color: #111827;
            padding: 10px 14px;
            font-size: 14px;
            line-height: 1;
            border-radius: 6px;
            cursor: pointer;
          }

          .selected-list-print-root {
            max-width: 8in;
            margin: 0 auto;
            background: white;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
            padding: 24px;
            box-sizing: border-box;
          }

          .selected-list-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 18px;
          }

          .selected-list-header h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1.2;
          }

          .selected-list-header p,
          .selected-list-header div {
            margin: 0;
            font-size: 13px;
            line-height: 1.4;
          }

          .selected-list-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .selected-list-table th,
          .selected-list-table td {
            border: 1px solid #111827;
            padding: 10px 12px;
            font-size: 14px;
            text-align: left;
            vertical-align: middle;
          }

          .selected-list-table th {
            background: #e5e7eb;
            font-weight: 700;
          }

          .selected-list-table tr {
            page-break-inside: avoid;
            break-inside: avoid-page;
          }

          .checkbox-cell {
            width: 64px;
            text-align: center;
          }

          .checkbox-box {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #111827;
            box-sizing: border-box;
          }

          @media print {
            html,
            body {
              background: white;
              padding: 0;
            }

            .print-preview-toolbar {
              display: none !important;
            }

            .selected-list-print-root {
              max-width: none;
              margin: 0;
              box-shadow: none;
              padding: 0;
            }

            thead {
              display: table-header-group;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-preview-toolbar">
          <button type="button" onclick="window.print()">Print / Save PDF</button>
        </div>
        <div class="selected-list-print-root">
          <div class="selected-list-header">
            <div>
              <h1>Selected Registration Checklist</h1>
              <p>Tournament ID: ${tournamentId}</p>
            </div>
            <div style="text-align:right;">
              <div>${sortedRegistrations.length} selected</div>
            </div>
          </div>
          <table class="selected-list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Event Number</th>
                <th>Rank</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>${rowsMarkup}</tbody>
          </table>
        </div>
      </body>
    </html>
  `
}
// declare module '@tanstack/react-table' {
//   interface FilterFns {
//     fuzzy: FilterFn<unknown>
//   }
//   interface FilterMeta {
//     itemRank: RankingInfo
//   }
// }

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta?.({ itemRank });
  return itemRank.passed;
};

// // Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
// const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
//   // Rank the item
//   const itemRank = rankItem(row.getValue(columnId), value)

//   // Store the itemRank info
//   addMeta({
//     itemRank,
//   })

//   // Return if the item should be filtered in/out
//   return itemRank.passed
// }


export function ManageDivisions({
  tournamentId,
  search,
}: {
  tournamentId: number
  search: ManageDivisionsSearch
}) {

  const [selectedRegistrations, setSelectedRegistrations] = useAtom(selectedRegistrationsAtom);
  const navigate = useNavigate();


    const { data: registrations, isLoading: participantLoading } = useQuery<any[]>({
        queryKey: ['tournament-registrations', tournamentId],
        queryFn: () => getTournamentRegistrations(tournamentId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
    const columns = useMemo<ColumnDef<RegistrationRow>[]>(
      () => [
        // {
        //   header: 'First Name',
        //   accessorKey: 'firstName',
        // },
        // {
        //   header: 'Last Name',
        //   accessorKey: 'lastName',
        // },
        {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
        {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: 'fullName',
        header: 'Full Name',
        cell: (info) => info.getValue(), 
        filterFn: "fuzzy"      
      },
      {
          header: 'Event Number',
          accessorKey: 'eventDisplayName',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Participant Gender',
          accessorKey: 'participantGender',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Rank',
          accessorKey: 'participantRank',
          sortingFn: (rowA, rowB) =>
            rowA.original.participantRankOrder - rowB.original.participantRankOrder,
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
          cell: ({ row }) => {
            const color = row.original.participantRank

            if (isBeltColor(color)) {
              return <Pill color={color}>{color}</Pill>
            }

            // fallback for unexpected values
            return <span>{color}</span>
          },
        },
        {
          header: 'Division',
          accessorKey: 'divisionName',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Event',
          accessorKey: 'eventName',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Division Gender',
          accessorKey: 'divisionGender',
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Checked In',
          accessorKey: 'checkedIn',
          cell: ({ getValue }) => {
            const value = getValue<boolean>()
            return value ? 'Checked In' : 'Not Checked In'
          },
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
        {
          header: 'Paid',
          accessorKey: 'isPaid',
          cell: ({ getValue }) => {
            const value = getValue<boolean>()
            return value ? 'Paid' : 'Unpaid'
          },
          filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true
            return filterValue.includes(row.getValue(columnId))
          },
        },
      ],
      [],
    )

  const flattened = useMemo(() => {
  if (!registrations) return []
  return registrations.flatMap((p: any) =>
    (p.registrations ?? []).map((r: any) => ({
      id: p.id,
      registrationId: r.id,
      firstName: p.firstName,
      lastName: p.lastName,

      participantGender: p.gender.description,
      participantRank: p.rank.beltColor,
      participantRankOrder: p.rank.sortOrder,
      isPaid: p.paid,
      checkedIn: p.checkedIn,

      divisionGender: r.tournamentEventDivision.eventGender.description?.toLowerCase() === "both"
    ? "Coed"
    : r.tournamentEventDivision.eventGender.description,
      divisionName: normalizeName(r.tournamentEventDivision.division.divisionType.name),
      divisionRank: r.tournamentEventDivision.division.beltRank.beltColor,
      divisionBeltOrder: r.tournamentEventDivision.division.beltRank.sortOrder,
      minAge: r.tournamentEventDivision.division.divisionType.minAge,
      maxAge: r.tournamentEventDivision.division.divisionType.maxAge,
      eventDisplayName: normalizeName(r.tournamentEventDivision.displayName),
      eventName: normalizeName(r.tournamentEventDivision.tournamentEvent.event.name),
      
    }))
  )
}, [registrations])




  const eventOptions = useMemo(() => {
    if (!flattened) return [] as string[];
    return Array.from(new Set(flattened.map((r: any) => r.eventDisplayName))).sort((a: string, b: string) => eventNumberCollator.compare(a, b));
  }, [flattened]);
  const rowSelection = useMemo(
    () => buildRowSelectionFromRegistrations(selectedRegistrations),
    [selectedRegistrations],
  )

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => buildColumnFiltersFromSearch(search));

  useEffect(() => {
    if (participantLoading) {
      return
    }

    const registrationsById = new Map(flattened.map((registration) => [registration.registrationId, registration]))

    setSelectedRegistrations((currentSelectedRegistrations) => {
      const nextSelectedRegistrations = currentSelectedRegistrations.flatMap((registration) => {
        const nextRegistration = registrationsById.get(registration.registrationId)
        return nextRegistration ? [nextRegistration] : []
      })

      if (
        nextSelectedRegistrations.length === currentSelectedRegistrations.length
        && nextSelectedRegistrations.every(
          (registration, index) => registration.registrationId === currentSelectedRegistrations[index]?.registrationId,
        )
      ) {
        return currentSelectedRegistrations
      }

      return nextSelectedRegistrations
    })
  }, [flattened, participantLoading, setSelectedRegistrations])

  useEffect(() => {
    const nextColumnFilters = buildColumnFiltersFromSearch(search)

    setColumnFilters((currentColumnFilters) => {
      const currentSearch = buildSearchFromColumnFilters(currentColumnFilters)
      const nextSearch = buildSearchFromColumnFilters(nextColumnFilters)

      return isSameSearch(currentSearch, nextSearch) ? currentColumnFilters : nextColumnFilters
    })
  }, [search])

  function createDraw(route: "/organizer/divisions" | "/organizer/divisions-double") {
    navigate({ to: route });
  }

  function handlePrintSelectedList() {
    if (selectedRegistrations.length === 0) {
      return
    }

    const printMarkup = buildSelectedListPrintDocumentMarkup(selectedRegistrations, tournamentId)
    const printBlob = new Blob([printMarkup], { type: "text/html" })
    const printUrl = URL.createObjectURL(printBlob)
    const printWindow = window.open(printUrl, "_blank")

    if (!printWindow) {
      URL.revokeObjectURL(printUrl)
    }
  }

   const table = useReactTable({
       data: flattened ?? [],
       columns,
       state: { sorting, columnFilters, rowSelection },
       onSortingChange: setSorting,
       onColumnFiltersChange: (updater) => {
        setColumnFilters((currentColumnFilters) => {
          const nextColumnFilters = functionalUpdate(updater, currentColumnFilters)
          const nextSearch = buildSearchFromColumnFilters(nextColumnFilters)

          if (!isSameSearch(search, nextSearch)) {
            navigate({
              to: "/tournament/organizer/manage-divisions/$id",
              params: { id: tournamentId },
              search: nextSearch,
              replace: true,
            })
          }

          return nextColumnFilters
        })
       },
       onRowSelectionChange: (updater) => {
        const nextRowSelection = functionalUpdate(updater, rowSelection)
        const nextSelectedRegistrations = flattened.filter(
          (registration) => nextRowSelection[String(registration.registrationId)],
        )

        setSelectedRegistrations(nextSelectedRegistrations)
       },
       getRowId: (row) => String(row.registrationId),
       enableRowSelection: true,
       getCoreRowModel: getCoreRowModel(),
       getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
      filterFns: {
    fuzzy: fuzzyFilter, // placeholder
  },
    });   


const fullNameColumn = table.getColumn("fullName");
const eventNameColumn = table.getColumn("eventName");
const eventSegmentValue = (() => {
  const filterValue = eventNameColumn?.getFilterValue();

  if (Array.isArray(filterValue) && filterValue.length === 1 && typeof filterValue[0] === "string") {
    return filterValue[0];
  }

  return "all";
})();

function onEventChanged(value: string) {
  if (!eventNameColumn) {
    return;
  }
  eventNameColumn.setFilterValue(value === "all" ? undefined : [value]);
}

const participantGenderColumn = table.getColumn("participantGender");
const participantGenderSegmentValue = (() => {  
  const filterValue = participantGenderColumn?.getFilterValue();

  if (Array.isArray(filterValue) && filterValue.length === 1 && typeof filterValue[0] === "string") {
    return filterValue[0];
  }

  return "all";
})();

function onParticipantGenderChanged(value: string) {
  if (!participantGenderColumn) {
    return;
  }
  participantGenderColumn.setFilterValue(value === "all" ? undefined : [value]);
}

  return (
    <div className="min-h-screen bg-gray-900 p-6">
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-white">Create Divisions for Tournament ID: {tournamentId}</h2>
      <div className="mb-4 flex flex-wrap gap-4 items-center text-white" >
        {/* <div className="flex items-center gap-2"> */}
          <Filter column={fullNameColumn!} placeholder="Search full name" />
            <ReactSelectMulti
            options={eventOptions}
            selected={(table.getColumn("eventDisplayName")?.getFilterValue() as string[]) ?? []}
            onChange={(vals) => table.getColumn("eventDisplayName")?.setFilterValue(vals)}
            placeholder="Event numbers"
            />
        {/* </div> */}
        <SegmentedButton 
        value={eventSegmentValue}
        onChange={onEventChanged}
        options={[
          { label: "All", value: "all" },
          { label: "Kata", value: "Kata" },
          { label: "Kumite", value: "Kumite" },
          { label: "Kobudo", value: "Kobudo" },
        ]}
        />
        <SegmentedButton 
        value={participantGenderSegmentValue}
        onChange={onParticipantGenderChanged}
        options={[
          { label: "All", value: "all" },
          { label: "Male", value: "Male" },
          { label: "Female", value: "Female" },
        ]}
        />
        <FilterBar table={table} />
</div>

{table.getState().columnFilters.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-4">
    
    {table.getState().columnFilters.flatMap(filter => {
      const column = table.getColumn(filter.id)
      const values = Array.isArray(filter.value) ? filter.value : [filter.value]
      // skip filters that render their own chips (full name search and event multiselect)
      if (filter.id === "fullName") return null
      
      if (filter.id === "participantRank") {
      }
      return values.map(v => {
        let label = String(v)
        let color:BeltColor = "Blue"
        if (filter.id === "participantRank" && isBeltColor(v as string)) {
          color = v as BeltColor
        }
        if(filter.id === "isPaid" || filter.id === "checkedIn") {
          label = `${filter.id === "isPaid"? v? "Paid" : "Unpaid" : v? "Checked In" : "Not Checked In"  }`
        }
        return (  
          <PillButton
            key={`${filter.id}-${v}`}
            color={color}
            onRemove={() => {
              if (column) {
                const newValues = values.filter(val => val !== v)
                if (newValues.length === 0) {
                  column.setFilterValue(undefined)
                } else {
                  column.setFilterValue(newValues)
                }
              }
            }}
          >
            {label}
          </PillButton>
        )
      })
    })}
     <button
                          onClick={() => table.resetColumnFilters()}
                          disabled={table.getState().columnFilters.length === 0}
                          className={`px-3 py-1 rounded transition ${table.getState().columnFilters.length === 0
                                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                              }`}
                      >
                          Clear Filters
                      </button>
  </div>
)}

      <div className="overflow-x-auto overflow-y-auto rounded-lg border border-gray-700 min-h-[200px] max-h-[60vh]">
                  <div className="flex items-center justify-end gap-3 mb-2">
                      
                     

                      
                  </div>
       {!participantLoading ? (
        <table className="w-full text-sm text-gray-200">
          <thead className="sticky top-0 z-20 bg-gray-800 text-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} colSpan={header.colSpan} className="px-4 py-3 text-left relative overflow-visible bg-gray-800 sticky top-0 z-20">
                    {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-2">
                            <div
                              role="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                            <div className="ml-1">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp size={14} />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronsUpDown size={14} />
                              )}
                            </div>
                          </div>
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
            <tbody  className="divide-y divide-gray-700">
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-800 transition-colors">
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-3">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                 {table.getRowModel().rows.length === 0 && (
                                  <tr>
                                      <td
                                          colSpan={table.getAllLeafColumns().length}
                                          className="px-4 py-6 text-center text-gray-400"
                                      >
                                          No participants match your filters
                                      </td>
                                  </tr>
                              )}
            </tbody>
        </table>
) : (
  <p className="text-white">Loading participants...</p>
)}
         </div>
          <div className="h-4" />
          {/* Button to set selected registrations and navigate */}
          <div className="my-4 flex flex-wrap gap-3">
            <button
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50"
              disabled={selectedRegistrations.length === 0}
              onClick={handlePrintSelectedList}
            >
              Print Selected List
            </button>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={selectedRegistrations.length === 0}
              onClick={() => createDraw("/organizer/divisions")}
            >
              Create Single Elimination Draw
            </button>

            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
              disabled={selectedRegistrations.length === 0}
              onClick={() => createDraw("/organizer/divisions-double")}
            >
              Create Double Elimination Draw
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-gray-200">
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="w-16 px-2 py-1 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
          className="px-2 py-1 bg-gray-800 rounded-md border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 text-gray-400">
        {table.getPrePaginationRowModel().rows.length} Filtered Registrations
        
      </div>
      <div className="mt-4 text-gray-400">
        {selectedRegistrations.length} Selected Registrations
        
      </div>
       <div className="mt-4 text-gray-400">
        
        {table.getPreSelectedRowModel().rows.length} Total Registrations
      </div>
    </div>
    </div>
  );
}




type FilterBarProps = {
  table: Table<any>
}

function FilterBar({ table }: FilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="relative">
      {/* This button stays inline with the inputs */}
      <button
        onClick={() => setIsFilterOpen(o => !o)}
        aria-label={isFilterOpen ? "Close filters" : "Open filters"}
        aria-expanded={isFilterOpen}
        className={
          isFilterOpen
            ? "text-blue-400 hover:text-blue-300 transition"
            : "text-gray-300 hover:text-white transition"
        }
      >
        {isFilterOpen ? <FilterX size={16} /> : <FilterIcon size={16} />}
      </button>

      {/* This panel appears BELOW the row, not inline */}
      {isFilterOpen && (
        <div className="absolute left-0 mt-2 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 w-max">
          <div className="flex flex-wrap gap-4">
            {table.getColumn("divisionName") && (
              <CheckboxFilter
                column={table.getColumn("divisionName")!}
                options={['Pee-Wee','Junior',  'Youth', 'Adult', 'Masters', 'Senior', 'Kids Weapons', 'Adult Weapons']}
              />
            )}


            {table.getColumn("participantRank") && (
              <CheckboxFilter
                column={table.getColumn("participantRank")!}
                options={['White', 'Yellow', 'Orange', 'Green','Purple', 'Blue', 'Brown', 'Black']}
              />
            )}

            
              {table.getColumn("checkedIn") && (
              <CheckboxFilter
                column={table.getColumn("checkedIn")!}
                options={[true, false]}
                labels={{ true: "Checked In", false: "Not Checked In" }}
              />
            )}

            {table.getColumn("isPaid") && (
              <CheckboxFilter
                column={table.getColumn("isPaid")!}
                options={[true, false]}
                labels={{ true: "Paid", false: "Unpaid" }}
              />
            )}
          </div>
        </div>
      )}
      
     
    </div>
  )
}


function Filter({ column, placeholder }: { column: Column<any, unknown>, placeholder?: string }) {
  const columnFilterValue = column.getFilterValue()

  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={placeholder ?? `Search...`}
      className="px-2 py-1 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
    />
  )
}


