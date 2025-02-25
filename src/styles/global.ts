import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primaryDark,
  },
  appBar: {
    backgroundColor: colors.primary,
  },
  logo : {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  searchBar: {
    height: 50,
    margin: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.secondary,
    borderRadius: 25,
    elevation: 3,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 5,
  },
  searchInput: {
    height: 40,
  },
  bottomNav: {
    backgroundColor: colors.primary,
  },
  fab: {
    position: "absolute",
    backgroundColor: colors.primary,
  },
});
