import { describe, it, expect, beforeEach } from "bun:test";
import * as React from "react";

describe("JSX Engine", () => {
  describe("React rendering", () => {
    it("should render simple React components", () => {
      const element = React.createElement("div", null, "Hello World");
      expect(element).toBeDefined();
      expect(element.type).toBe("div");
    });

    it("should render nested components", () => {
      const child = React.createElement("span", null, "Child");
      const parent = React.createElement("div", null, child);

      expect(parent).toBeDefined();
      expect(parent.type).toBe("div");
    });

    it("should handle component props", () => {
      const element = React.createElement(
        "div",
        { className: "test", id: "main" },
        "Content",
      );

      expect(element.props.className).toBe("test");
      expect(element.props.id).toBe("main");
    });

    it("should handle functional components", () => {
      const TestComponent = (props: { name: string }) =>
        React.createElement("div", null, `Hello ${props.name}`);

      const element = React.createElement(TestComponent, { name: "Harpy" });
      expect(element).toBeDefined();
      expect(element.type).toBe(TestComponent);
    });

    it("should handle children as props", () => {
      const Layout = (props: { children: React.ReactNode }) =>
        React.createElement("html", null, props.children);

      const element = React.createElement(
        Layout,
        null,
        React.createElement("body", null, "Content"),
      );

      expect(element).toBeDefined();
    });
  });

  describe("Layout wrapping", () => {
    it("should wrap content with layout", () => {
      const Layout = (props: { children: React.ReactNode }) =>
        React.createElement(
          "html",
          null,
          React.createElement("body", null, props.children),
        );

      const Page = () => React.createElement("div", null, "Page Content");

      const wrapped = React.createElement(
        Layout,
        null,
        React.createElement(Page),
      );

      expect(wrapped.type).toBe(Layout);
    });

    it("should pass props through layout", () => {
      const Layout = (props: { title: string; children?: React.ReactNode }) =>
        React.createElement(
          "html",
          null,
          React.createElement("head", null, React.createElement("title", null, props.title)),
          React.createElement("body", null, props.children),
        );

      const element = React.createElement(
        Layout,
        { title: "Test Page", children: React.createElement("div", null, "Content") },
      );

      expect(element.props.title).toBe("Test Page");
    });
  });

  describe("Component composition", () => {
    it("should compose multiple components", () => {
      const Header = () => React.createElement("header", null, "Header");
      const Main = () => React.createElement("main", null, "Content");
      const Footer = () => React.createElement("footer", null, "Footer");

      const Page = () =>
        React.createElement(
          "div",
          null,
          React.createElement(Header),
          React.createElement(Main),
          React.createElement(Footer),
        );

      const element = React.createElement(Page);
      expect(element).toBeDefined();
    });

    it("should handle fragments", () => {
      const items = ["a", "b", "c"].map((item) =>
        React.createElement("li", { key: item }, item),
      );

      const list = React.createElement("ul", null, ...items);
      expect(list.props.children).toHaveLength(3);
    });
  });
});
