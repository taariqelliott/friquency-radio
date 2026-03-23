"use client";
import { createClient } from "@/utils/supabase/client";
import {
  Drawer,
  Modal,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrightness2,
  IconHome,
  IconMenu2,
  IconMoonStars,
  IconRadio,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ProfileEditPage from "../profile/edit/page";

interface User {
  username: string;
}

export default function Header() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const buttons = [
    {
      icon: <IconHome />,
      label: "Home",
      onClick: () => (window.location.href = "/"),
    },
    {
      icon: <IconRadio />,
      label: "Stations",
      onClick: () => (window.location.href = "/rooms/all"),
    },
  ];

  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile, error } = await supabase
          .from("users")
          .select("username")
          .eq("id", authUser.id)
          .single();
        if (error) throw error;
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  }, [supabase]);

  const searchDependency = searchParams.get("auth");

  useEffect(() => {
    fetchUser();
  }, [fetchUser, searchDependency]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <Modal
        opened={modalOpened}
        centered
        onClose={closeModal}
        title="Edit your profile"
      >
        <ProfileEditPage />
      </Modal>

      <div className="fixed right-3 top-3 z-20">
        <div className="flex items-start gap-2">
          {user && (
            <button
              onClick={openModal}
              className="app-pill hidden md:inline-flex"
            >
              <span className="text-lime-500">@</span>
              {user.username}
            </button>
          )}

          <div className="app-panel-soft hidden items-center gap-2 p-2 md:flex">
            <button
              onClick={toggleColorScheme}
              className="app-action-secondary h-11 w-11 px-0"
              aria-label="Toggle color scheme"
            >
              {isClient &&
                (colorScheme === "dark" ? (
                  <IconBrightness2 stroke={2} />
                ) : (
                  <IconMoonStars stroke={2} />
                ))}
            </button>
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className="app-action-secondary h-11 w-11 px-0"
                aria-label={button.label}
              >
                {button.icon}
              </button>
            ))}
          </div>

          <div className="md:hidden">
            <button
              onClick={openDrawer}
              className="app-action-secondary h-11 w-11 px-0"
              aria-label="Open navigation"
            >
              <IconMenu2 />
            </button>
            <Drawer
              opened={drawerOpened}
              onClose={closeDrawer}
              title="Friquency Radio"
              transitionProps={{
                transition: "rotate-left",
                duration: 150,
                timingFunction: "linear",
              }}
              padding="md"
              size="75%"
              position="top"
            >
              <div className="flex flex-col gap-3">
                {user && (
                  <button onClick={openModal} className="app-pill self-start">
                    <span className="text-lime-500">@</span>
                    {user.username}
                  </button>
                )}

                <button
                  onClick={toggleColorScheme}
                  className="app-action-secondary w-full"
                >
                  {isClient &&
                    (colorScheme === "dark" ? (
                      <IconBrightness2 stroke={2} />
                    ) : (
                      <IconMoonStars stroke={2} />
                    ))}
                </button>

                {buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={button.onClick}
                    className="app-action-secondary w-full gap-2"
                  >
                    {button.icon}
                    <span>{button.label}</span>
                  </button>
                ))}
              </div>
            </Drawer>
          </div>
        </div>
      </div>
    </>
  );
}
