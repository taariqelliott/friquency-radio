"use client";
import { createClient } from "@/utils/supabase/client";
import {
  useMantineColorScheme,
  Button,
  MantineProvider,
  Modal,
  Drawer,
} from "@mantine/core";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { IconBrightness2, IconMoonStars, IconMenu2 } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
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
    { label: "home", onClick: () => (window.location.href = "/") },
    { label: "rooms", onClick: () => (window.location.href = "/rooms/all") },
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

  const sessionDependency = supabase.auth.getSession();
  const searchDependency = searchParams.get("auth");

  useEffect(() => {
    fetchUser();
  }, [fetchUser, searchDependency, sessionDependency]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className="absolute z-10 text-white right-2 mt-2">
        <div className="flex flex-row items-start">
          {user && (
            <div>
              <Modal
                opened={modalOpened}
                centered
                onClose={closeModal}
                title="Edit your profile"
              >
                <ProfileEditPage />
              </Modal>
              <button
                onClick={openModal}
                className="hover:text-pink-500 mr-2 mt-[2px]"
              >
                <span className="text-sm bg-black border hidden md:flex rounded-md border-pink-500 px-2 py-1">
                  <span className=" text-green-500">@</span>
                  {user.username}
                </span>
              </button>
            </div>
          )}
          <div className="hidden md:flex flex-col gap-1">
            <Button
              variant="filled"
              color="#ec4899"
              onClick={toggleColorScheme}
              className="w-20 hover:opacity-40 transition-all duration-300"
            >
              {isClient &&
                (colorScheme === "dark" ? (
                  <IconBrightness2 stroke={2} />
                ) : (
                  <IconMoonStars stroke={2} />
                ))}
            </Button>
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant="filled"
                color="#ec4899"
                onClick={button.onClick}
                className="w-20 hover:opacity-40 transition-all duration-300"
              >
                {button.label}
              </Button>
            ))}
          </div>
          <div className="md:hidden">
            <Button
              variant="filled"
              color="#ec4899"
              onClick={openDrawer}
              className="hover:opacity-70 transition-all duration-300"
            >
              <IconMenu2 />
            </Button>
            <Drawer
              opened={drawerOpened}
              onClose={closeDrawer}
              title="Friquency Radio"
              transitionProps={{
                transition: "rotate-left",
                duration: 150,
                timingFunction: "linear",
              }}
              // padding="md"
              size="50%"
              position="top"
            >
              <div className="flex flex-col gap-2">
                <button
                  onClick={openModal}
                  className="hover:text-pink-500 mr-2 mt-[2px]"
                >
                  <span className="text-sm bg-black border rounded-md border-pink-500 px-2 py-1">
                    <span className=" text-green-500">@</span>
                    {user?.username}
                  </span>
                </button>
                <Button
                  variant="filled"
                  color="#ec4899"
                  onClick={toggleColorScheme}
                  className="w-full hover:opacity-40 transition-all duration-300"
                >
                  {isClient &&
                    (colorScheme === "dark" ? (
                      <IconBrightness2 stroke={2} />
                    ) : (
                      <IconMoonStars stroke={2} />
                    ))}
                </Button>

                {buttons.map((button, index) => (
                  <Button
                    key={index}
                    variant="filled"
                    color="#ec4899"
                    onClick={button.onClick}
                    className="w-full hover:opacity-40 transition-all duration-300"
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </Drawer>
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}
