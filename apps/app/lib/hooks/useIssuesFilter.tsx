// hooks
import useTheme from "./useTheme";
import useUser from "./useUser";
// commons
import { groupBy, orderArrayBy } from "constants/common";
// constants
import { PRIORITIES } from "constants/";
// types
import type { IssueResponse, IIssue } from "types";

const useIssuesFilter = (projectIssues?: IssueResponse) => {
  const {
    issueView,
    setIssueView,
    groupByProperty,
    setGroupByProperty,
    orderBy,
    setOrderBy,
    filterIssue,
    setFilterIssue,
  } = useTheme();

  const { states } = useUser();

  let groupedByIssues: {
    [key: string]: IIssue[];
  } = {
    ...(groupByProperty === "state_detail.name"
      ? Object.fromEntries(
          states
            ?.sort((a, b) => a.sequence - b.sequence)
            ?.map((state) => [
              state.name,
              projectIssues?.results.filter((issue) => issue.state === state.name) ?? [],
            ]) ?? []
        )
      : groupByProperty === "priority"
      ? Object.fromEntries(
          PRIORITIES.map((priority) => [
            priority,
            projectIssues?.results.filter((issue) => issue.priority === priority) ?? [],
          ])
        )
      : {}),
    ...groupBy(projectIssues?.results ?? [], groupByProperty ?? ""),
  };

  if (orderBy !== null) {
    groupedByIssues = Object.fromEntries(
      Object.entries(groupedByIssues).map(([key, value]) => [
        key,
        orderArrayBy(value, orderBy, "descending"),
      ])
    );
  }

  if (filterIssue !== null) {
    if (filterIssue === "activeIssue") {
      const filteredStates = states?.filter(
        (state) => state.group === "started" || state.group === "unstarted"
      );
      groupedByIssues = Object.fromEntries(
        filteredStates
          ?.sort((a, b) => a.sequence - b.sequence)
          ?.map((state) => [
            state.name,
            projectIssues?.results.filter((issue) => issue.state === state.id) ?? [],
          ]) ?? []
      );
    } else if (filterIssue === "backlogIssue") {
      const filteredStates = states?.filter(
        (state) => state.group === "backlog" || state.group === "cancelled"
      );
      groupedByIssues = Object.fromEntries(
        filteredStates
          ?.sort((a, b) => a.sequence - b.sequence)
          ?.map((state) => [
            state.name,
            projectIssues?.results.filter((issue) => issue.state === state.id) ?? [],
          ]) ?? []
      );
    }
  }

  if (groupByProperty === "priority" && orderBy === "priority") {
    setOrderBy(null);
  }

  return {
    groupedByIssues,
    issueView,
    setIssueView,
    groupByProperty,
    setGroupByProperty,
    orderBy,
    setOrderBy,
    filterIssue,
    setFilterIssue,
  } as const;
};

export default useIssuesFilter;