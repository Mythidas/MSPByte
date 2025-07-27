'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Drawer,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTableURLState } from '@/hooks/common/useTableURLState';
import {
  FilterValue,
  FilterPrimitive,
  FilterPrimitiveTuple,
  DataTableFilter,
  FilterType,
} from '@/types/data-table';
import { ColumnFiltersState, SortingState, Table, Updater } from '@tanstack/react-table';
import {
  FunnelPlus,
  Funnel,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  List,
  Filter,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DataTableFilterBoolean,
  DataTableFilterDate,
  DataTableFilterMultiSelect,
  DataTableFilterNumber,
  DataTableFilterSelect,
  DataTableFilterText,
} from '@/components/shared/table/DataTableFilterRender';

type DataTableDrawerProps<TData> = {
  filters: Record<string, Record<string, DataTableFilter>>;
  onInit: () => void;
  table: Table<TData>;
  setFilters: (filters: ColumnFiltersState) => void;
  setSorting: (updater: Updater<SortingState>) => void;
  sorting: SortingState;
  clientSide?: boolean;
};

export function DataTableFilters<TData>({
  filters,
  onInit,
  table,
  setFilters,
  setSorting,
  sorting,
  clientSide,
}: DataTableDrawerProps<TData>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Record<string, FilterValue>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(filters).map((key) => [key, true]))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const { initialFilters, initialSorting, applyUrlState, isReady } = useTableURLState();
  const initFilters = useRef(false);
  const searchParams = useSearchParams();

  // Get active filter count for badge
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  useEffect(() => {
    if (!isReady || initFilters.current) return;
    setFilters(initialFilters);
    setSorting(initialSorting);
    initFilters.current = true;
    onInit?.();
  }, [isReady, initialFilters, initialSorting]);

  useEffect(() => {
    if (clientSide || !initFilters.current) return;

    const filtersChanged =
      JSON.stringify(initialFilters) !== JSON.stringify(table.getState().columnFilters);
    const sortingChanged =
      JSON.stringify(initialSorting) !== JSON.stringify(table.getState().sorting);

    if (filtersChanged) setFilters(initialFilters);
    if (sortingChanged) setSorting(initialSorting);
  }, [searchParams.toString()]);

  useEffect(() => {
    const currentFilters = table.getState().columnFilters;
    const pending: Record<string, FilterValue> = {};
    const active: Record<string, boolean> = {};

    // Process nested filters
    Object.entries(filters).forEach(([groupKey, groupFilters]) => {
      Object.entries(groupFilters).forEach(([filterKey]) => {
        const fullKey = `${groupKey}.${filterKey}`;
        const found = currentFilters.find((f) => f.id === filterKey);

        if (found) {
          pending[fullKey] = found.value as FilterValue;
          active[fullKey] = true;
        } else {
          active[fullKey] = false;
        }
      });
    });

    setPendingFilters(pending);
    setActiveFilters(active);
  }, [drawerOpen, table, filters, table.getState().columnFilters]);

  const handleFilterApply = () => {
    setDrawerOpen(false);
    initFilters.current = false;
    const applied: ColumnFiltersState = [];

    for (const [fullKey, rawValue] of Object.entries(pendingFilters)) {
      if (!activeFilters[fullKey]) continue;

      const [groupKey, filterKey] = fullKey.split('.');
      const filterMeta = filters[groupKey]?.[filterKey];

      if (!filterMeta) continue;

      let value = rawValue;
      switch (filterMeta.type) {
        case 'boolean':
          value = { op: 'eq', value: (rawValue?.value ?? false) as FilterPrimitive | undefined };
          break;
        case 'text':
          value = { op: 'ilike', value: (rawValue?.value ?? '') as FilterPrimitive | undefined };
          break;
        case 'select':
          value = { op: 'eq', value: (rawValue?.value ?? '') as FilterPrimitive | undefined };
          break;
        case 'multiselect':
          value = { op: 'in', value: (rawValue?.value ?? []) as FilterPrimitive | undefined };
          break;
        case 'number':
        case 'date':
          const opTuple = value.value as FilterPrimitiveTuple;
          if (
            value.value === undefined ||
            (value.op === 'bt' && (!opTuple?.[0] || !opTuple?.[1]))
          ) {
            continue;
          }
          break;
      }

      applied.push({ id: filterKey, value });
    }

    if (clientSide) setFilters(applied);
    applyUrlState({ filters: applied, sorting });
  };

  const handleFilterClear = () => {
    setDrawerOpen(false);
    const cleared: Record<string, FilterValue> = {};

    Object.entries(filters).forEach(([groupKey, groupFilters]) => {
      Object.keys(groupFilters).forEach((filterKey) => {
        const fullKey = `${groupKey}.${filterKey}`;
        cleared[fullKey] = { op: 'eq', value: undefined };
      });
    });

    setPendingFilters(cleared);
    setActiveFilters({});
    applyUrlState({ filters: [], sorting });
    if (clientSide) setFilters([]);
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const getFilterIcon = (type: FilterType) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'boolean':
        return <ToggleLeft className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'select':
        return <List className="w-4 h-4" />;
      case 'multiselect':
        return <List className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  const renderFilter = (groupKey: string, filterKey: string, filterConfig: DataTableFilter) => {
    const fullKey = `${groupKey}.${filterKey}`;
    const currentValue = pendingFilters[fullKey] as FilterValue;
    const isActive = activeFilters[fullKey];

    // Filter by search term
    const filterLabel = filterConfig.label || filterKey;
    if (searchTerm && !filterLabel.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    const renderType = () => {
      switch (filterConfig.type) {
        case 'text':
          return (
            <DataTableFilterText
              meta={filterConfig}
              fullKey={fullKey}
              value={currentValue?.value as string}
              setPendingFilters={setPendingFilters}
            />
          );
        case 'boolean':
          return (
            <DataTableFilterBoolean
              meta={filterConfig}
              fullKey={fullKey}
              value={currentValue?.value as boolean}
              setPendingFilters={setPendingFilters}
            />
          );
        case 'select':
          return (
            <DataTableFilterSelect
              meta={filterConfig}
              fullKey={fullKey}
              value={currentValue?.value as string}
              setPendingFilters={setPendingFilters}
            />
          );
        case 'multiselect':
          return (
            <DataTableFilterMultiSelect
              meta={filterConfig}
              fullKey={fullKey}
              value={currentValue?.value as string[]}
              setPendingFilters={setPendingFilters}
            />
          );
        case 'number':
          return (
            <DataTableFilterNumber
              meta={filterConfig}
              fullKey={fullKey}
              value={currentValue?.value as number}
              setPendingFilters={setPendingFilters}
              op={currentValue?.op || (filterConfig.operations && filterConfig.operations[0])}
            />
          );
        case 'date':
          return (
            <DataTableFilterDate
              meta={filterConfig}
              fullKey={fullKey}
              value={currentValue?.value as string}
              setPendingFilters={setPendingFilters}
              op={currentValue?.op || (filterConfig.operations && filterConfig.operations[0])}
            />
          );
        default:
          return null;
      }
    };

    const getDefaultValue = (type: FilterType) => {
      switch (type) {
        case 'boolean':
          return false;
        default:
          return undefined;
      }
    };

    return (
      <div key={fullKey} className="space-y-3 p-3 border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id={fullKey}
              checked={isActive}
              onCheckedChange={(checked) => {
                setActiveFilters((prev) => ({ ...prev, [fullKey]: !!checked }));
                if (!checked) {
                  setPendingFilters((prev) => ({
                    ...prev,
                    [fullKey]: { op: 'eq', value: undefined },
                  }));
                } else {
                  setPendingFilters((prev) => ({
                    ...prev,
                    [fullKey]: {
                      op:
                        filterConfig.operations && filterConfig.operations[0] !== 'bt'
                          ? filterConfig.operations[0]
                          : 'eq',
                      value: getDefaultValue(filterConfig.type),
                    },
                  }));
                }
              }}
            />
            <Label htmlFor={fullKey} className="font-medium flex items-center gap-2">
              {getFilterIcon(filterConfig.type)}
              {filterLabel}
            </Label>
          </div>
          {isActive && (
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          )}
        </div>

        {isActive && renderType()}
      </div>
    );
  };

  const filteredGroups = Object.entries(filters).filter(([groupKey, groupFilters]) => {
    if (!searchTerm) return true;

    return Object.entries(groupFilters).some(([filterKey, filterConfig]) => {
      const filterLabel = filterConfig.label || filterKey;
      return (
        filterLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groupKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  });

  return (
    <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {activeFilterCount > 0 ? (
            <FunnelPlus className="w-4 h-4" />
          ) : (
            <Funnel className="w-4 h-4" />
          )}
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1 py-0 text-xs min-w-5 h-5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-[37vw]! max-w-[50vw]! h-full">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </DrawerTitle>
          <DrawerDescription>Configure filters to refine your data view</DrawerDescription>

          {/* Search filters */}
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search filters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredGroups.map(([groupKey, groupFilters]) => (
            <div key={groupKey} className="space-y-3">
              <Collapsible
                open={!collapsedGroups[groupKey]}
                onOpenChange={() => toggleGroup(groupKey)}
                className={cn(!collapsedGroups[groupKey] && 'space-y-2')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        {groupKey.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Object.keys(groupFilters).length}
                      </Badge>
                      {Object.entries(groupFilters).some(
                        ([filterKey]) => activeFilters[`${groupKey}.${filterKey}`]
                      ) && (
                        <Badge variant="secondary" className="text-xs">
                          {
                            Object.entries(groupFilters).filter(
                              ([filterKey]) => activeFilters[`${groupKey}.${filterKey}`]
                            ).length
                          }
                        </Badge>
                      )}
                    </div>
                    {collapsedGroups[groupKey] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-2">
                  {Object.entries(groupFilters).map(([filterKey, filterConfig]) =>
                    renderFilter(groupKey, filterKey, filterConfig)
                  )}
                </CollapsibleContent>
              </Collapsible>

              {groupKey !== Object.keys(filters)[Object.keys(filters).length - 1] && <Separator />}
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No filters match your search</p>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t bg-background">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleFilterClear} className="flex-1">
              Clear All
            </Button>
            <Button onClick={handleFilterApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
